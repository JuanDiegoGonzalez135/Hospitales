package utez.edu.mx.backhospitales.services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import utez.edu.mx.backhospitales.Utils.APIResponse;
import utez.edu.mx.backhospitales.Utils.FirebaseMessagingService;
import utez.edu.mx.backhospitales.models.*;
import utez.edu.mx.backhospitales.repositories.*;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

@Service
public class NotificationService {

    @Autowired
    private NotificacionRepository notificacionRepository;

    @Autowired
    private CamaRepository camaRepository;

    @Autowired
    private FirebaseMessagingService firebaseMessagingService;

    @Autowired
    private DispositivoEnfermeroRepository dispositivoEnfermeroRepository;

    /**
     * Método usado por el paciente (botón de ayuda)
     */
    public APIResponse registrarAyuda(Long camaId) {
        try {
            Optional<Cama> camaOpt = camaRepository.findById(camaId);

            if (camaOpt.isEmpty()) {
                return new APIResponse(true, "Cama no encontrada", HttpStatus.BAD_REQUEST);
            }

            Cama cama = camaOpt.get();

            // Crear notificación en BD
            Notificacion noti = createNotification(
                    cama,
                    cama.getPaciente(),
                    "El paciente de la cama " + cama.getNumero() + " ha solicitado ayuda.",
                    true,
                    true
            );

            return new APIResponse(noti, false, "Notificación registrada y enviada", HttpStatus.OK);

        } catch (Exception e) {
            e.printStackTrace();
            return new APIResponse(true, "Error al generar notificación", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Método GENERAL que PacienteService necesita
     * Crea una notificación y opcionalmente envía push.
     */
    public Notificacion createNotification(
            Cama cama,
            Paciente paciente,
            String mensaje,
            boolean enviarAIsla,
            boolean enviarAEnfermero
    ) {
        try {
            Notificacion noti = new Notificacion();
            noti.setCama(cama);
            noti.setPaciente(paciente);
            noti.setFecha(LocalDateTime.now());
            noti.setLeida(false);
            noti.setMensaje(mensaje);
            noti.setEnviadaAIsla(enviarAIsla);
            noti.setEnviadaAEnfermero(enviarAEnfermero);

            notificacionRepository.save(noti);

            if (enviarAEnfermero) {
                for (Enfermero enf : cama.getEnfermeros()) {
                    Optional<DispositivoEnfermero> dispOpt =
                            dispositivoEnfermeroRepository.findByEnfermeroId(enf.getId());

                    dispOpt.ifPresent(d -> firebaseMessagingService.sendNotificationToToken(
                            d.getToken(),
                            "Paciente solicita ayuda",
                            mensaje
                    ));
                }
            }

            return noti;

        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }
    }

    public List<Notificacion> getNotificationsForCama(Long camaId) {
        try {
            if (camaId == null) {
                return notificacionRepository.findAll();
            }
            return notificacionRepository.findByCamaIdOrderByFechaDesc(camaId);
        } catch (Exception e) {
            e.printStackTrace();
            return Collections.emptyList();
        }
    }
}
