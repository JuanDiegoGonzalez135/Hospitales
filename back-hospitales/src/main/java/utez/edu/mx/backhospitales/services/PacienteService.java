package utez.edu.mx.backhospitales.services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import utez.edu.mx.backhospitales.Utils.APIResponse;
import utez.edu.mx.backhospitales.models.Cama;
import utez.edu.mx.backhospitales.models.DispositivoPaciente;
import utez.edu.mx.backhospitales.models.Notificacion;
import utez.edu.mx.backhospitales.models.Paciente;
import utez.edu.mx.backhospitales.repositories.CamaRepository;
import utez.edu.mx.backhospitales.repositories.DispositivoPacienteRepository;
import utez.edu.mx.backhospitales.repositories.PacienteRepository;

import java.time.Instant;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class PacienteService {
    @Autowired
    private PacienteRepository pacienteRepository;

    @Autowired
    private DispositivoPacienteRepository dispositivoPacienteRepository;

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
            if (cama.getPaciente() == null){
                return new APIResponse(true, "No hay paciente asignado a esta cama", HttpStatus.OK);
            }
            Paciente paciente = cama.getPaciente();

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
            Map<String,Object> r = new HashMap<>();
            r.put("cama", cama.getCodigo());
            r.put("pacienteId", paciente.getId());
            r.put("camaId", cama.getId());
            r.put("mensaje", "Vinculado correctamente");
            return new APIResponse(r, false, "Vinculado", HttpStatus.OK);
        } catch (Exception ex){
            ex.printStackTrace();
            return new APIResponse(true, "Error al vincular dispositivo", HttpStatus.INTERNAL_SERVER_ERROR);
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
            Long now = Instant.now().toEpochMilli();
            Long last = lastHelpAt.getOrDefault(camaId, 0L);
            if (now - last < COOLDOWN_MS){
                long wait = (COOLDOWN_MS - (now - last)) / 1000;
                return new APIResponse(true, "Cooldown activo. Intenta en " + wait + "s", HttpStatus.OK);
            }
            lastHelpAt.put(camaId, now);
            // Crear notificacion
            Notificacion n = notificationService.createNotification(cama, cama.getPaciente(), "Paciente solicitó ayuda", true, true);

            Map<String,Object> resp = new HashMap<>();
            resp.put("notificacion", n);
            resp.put("mensaje", "Ayuda notificada");
            resp.put("cooldown_s", COOLDOWN_MS/1000);
            return new APIResponse(resp, false, "Ayuda registrada", HttpStatus.OK);
        } catch (Exception ex){
            ex.printStackTrace();
            return new APIResponse(true, "Error al solicitar ayuda", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

}