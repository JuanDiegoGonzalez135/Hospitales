package utez.edu.mx.backhospitales.services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import utez.edu.mx.backhospitales.Utils.APIResponse;
import utez.edu.mx.backhospitales.Utils.FirebaseMessagingService;
import utez.edu.mx.backhospitales.models.*;
import utez.edu.mx.backhospitales.repositories.CamaRepository;
import utez.edu.mx.backhospitales.repositories.DispositivoEnfermeroRepository;
import utez.edu.mx.backhospitales.repositories.DispositivoPacienteRepository;
import utez.edu.mx.backhospitales.repositories.PacienteRepository;

import java.time.Instant;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class PacienteService {
    @Autowired
    private PacienteRepository pacienteRepository;

    @Autowired
    private DispositivoPacienteRepository dispositivoPacienteRepository;

    @Autowired
    private DispositivoEnfermeroRepository dispositivoEnfermero;

    @Autowired
    private FirebaseMessagingService firebaseMessagingService;

    @Autowired
    private CamaRepository camaRepository;

    @Autowired
    private NotificationService notificationService;

    // cooldown map por camaId -> timestamp (ms)
    private final Map<Long, Long> lastHelpAt = new ConcurrentHashMap<>();

    // cooldown en ms (por defecto 12 segundos)
    private final long COOLDOWN_MS = 12_000L;

    public APIResponse vincularDispositivo(String deviceId, String codigoCama){
        try {
            Optional<Cama> opt = camaRepository.findByCodigo(codigoCama);
            if (opt.isEmpty()){
                return new APIResponse(true, "Codigo de cama no encontrado", HttpStatus.OK);
            }
            Cama cama = opt.get();

            // 1. OBTENER Y ASIGNAR EL PACIENTE (Último creado)
            Paciente paciente;
            
            if (cama.getPaciente() != null) {
                // Si la cama ya está ocupada, vinculamos el dispositivo al paciente que ya está allí.
                paciente = cama.getPaciente();
            } else {
                // Si la cama está libre, buscamos el ÚLTIMO paciente creado para asignarlo.
                paciente = pacienteRepository.findLastCreatedPatient();

                if (paciente == null) {
                    return new APIResponse(true, "No hay pacientes disponibles para asignar a la cama.", HttpStatus.OK);
                }

                // ASIGNAR EL PACIENTE A LA CAMA (Lógica de asignación)
                cama.setPaciente(paciente);
                camaRepository.save(cama);
            }
            
            // 2. VINCULAR EL DISPOSITIVO (Lógica de vinculación)
            // buscar si ya existe dispositivo con ese id
            Optional<DispositivoPaciente> existing = dispositivoPacienteRepository.findByDeviceId(deviceId);
            DispositivoPaciente dp;
            if (existing.isPresent()){
                dp = existing.get();
                dp.setCama(cama);
                dp.setPaciente(paciente);
                dp.setVinculado(true);
            } else {
                dp = new DispositivoPaciente();
                dp.setDeviceId(deviceId);
                dp.setCama(cama);
                dp.setPaciente(paciente);
                dp.setVinculado(true);
            }
            dispositivoPacienteRepository.save(dp);
            
            // 3. PREPARAR RESPUESTA
            Map<String,Object> r = new HashMap<>();
            r.put("cama", cama.getCodigo());
            r.put("pacienteId", paciente.getId());
            r.put("camaId", cama.getId());
            r.put("mensaje", "Vinculado y asignado correctamente");
            return new APIResponse(r, false, "Vinculado", HttpStatus.OK);
        } catch (Exception ex){
            ex.printStackTrace();
            return new APIResponse(true, "Error al vincular dispositivo", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // Liberar cama y desvincular dispositivos
    public APIResponse desvincularCama(Long idCama){
        try {
            Optional<Cama> optCama = camaRepository.findById(idCama);
            if (optCama.isEmpty()) {
                return new APIResponse(true, "Cama no encontrada para desvincular", HttpStatus.NOT_FOUND);
            }
            Cama cama = optCama.get();

            // 1. Liberar la cama (establecer paciente a NULL)
            Paciente pacienteDesvinculado = cama.getPaciente();
            cama.setPaciente(null);
            camaRepository.save(cama);

            // 2. Marcar todos los dispositivos asociados a esa cama/paciente como desvinculados
            if (pacienteDesvinculado != null) {
                dispositivoPacienteRepository.findByPaciente(pacienteDesvinculado)
                    .forEach(dp -> {
                        dp.setVinculado(false);                            
                        dispositivoPacienteRepository.save(dp);
                    });
            }

            return new APIResponse(false, "Cama liberada y dispositivos desvinculados", HttpStatus.OK);

        } catch (Exception ex) {
            ex.printStackTrace();
            return new APIResponse(true, "Error al liberar la cama", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }


    public APIResponse solicitarAyuda(Long camaId){
        try {
            Optional<Cama> opt = camaRepository.findById(camaId);
            if (opt.isEmpty()){
                return new APIResponse(true, "Cama no encontrada", HttpStatus.OK);
            }

            Cama cama = opt.get();

            if (cama.getPaciente() == null){
                return new APIResponse(true, "No hay paciente en la cama", HttpStatus.OK);
            }

            if (cama.getEnfermeros() == null || cama.getEnfermeros().isEmpty()){
                return new APIResponse(true, "No hay enfermeros asignados a la cama", HttpStatus.OK);
            }

            // 1️⃣ COOL-DOWN
            Long now = Instant.now().toEpochMilli();
            Long last = lastHelpAt.getOrDefault(camaId, 0L);

            if (now - last < COOLDOWN_MS){
                long wait = (COOLDOWN_MS - (now - last)) / 1000;
                return new APIResponse(true, "Cooldown activo. Intenta en " + wait + "s", HttpStatus.OK);
            }
            lastHelpAt.put(camaId, now);

            // 2️⃣ CREAR REGISTRO EN LA BD
            Notificacion n = notificationService.createNotification(
                    cama,
                    cama.getPaciente(),
                    "Paciente solicitó ayuda",
                    true,
                    true
            );

            // 3️⃣ ENVIAR NOTIFICACIÓN A **TODOS** LOS ENFERMEROS
            List<Enfermero> enfermeros = new ArrayList<>(cama.getEnfermeros());
            int envios = 0;

            for (Enfermero enf : enfermeros){

                Optional<DispositivoEnfermero> dispOp =
                        dispositivoEnfermero.findByEnfermeroId(enf.getId());

                if (dispOp.isEmpty()) continue;
                DispositivoEnfermero disp = dispOp.get();

                if (disp.getToken() == null) continue;

                firebaseMessagingService.sendNotificationToToken(
                        disp.getToken(),
                        "Ayuda solicitada",
                        "El paciente en la cama " + cama.getCodigo() + " solicitó ayuda."
                );

                envios++;
            }

            if (envios == 0){
                return new APIResponse(true, "Ningún enfermero tiene dispositivo registrado", HttpStatus.OK);
            }

            // 4️⃣ RESPUESTA FINAL
            Map<String,Object> resp = new HashMap<>();
            resp.put("notificacion", n);
            resp.put("mensaje", "Notificación enviada a " + envios + " enfermeros");
            resp.put("cooldown_s", COOLDOWN_MS/1000);

            return new APIResponse(resp, false, "Ayuda registrada", HttpStatus.OK);

        } catch (Exception ex){
            ex.printStackTrace();
            return new APIResponse(true, "Error al enviar notificaciones", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}