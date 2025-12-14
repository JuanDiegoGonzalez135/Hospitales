package utez.edu.mx.backhospitales.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.HttpStatus;
import utez.edu.mx.backhospitales.Utils.APIResponse;
import utez.edu.mx.backhospitales.Utils.PasswordEncoder;
import utez.edu.mx.backhospitales.models.*;
import utez.edu.mx.backhospitales.repositories.*;
import utez.edu.mx.backhospitales.services.CamaService;
import utez.edu.mx.backhospitales.services.NotificationService;

import java.util.List;
import java.util.UUID;

@RestController
@CrossOrigin("*")
@RequestMapping("/api/hospitales/isla")
public class IslaController {

    @Autowired
    private CamaService camaService;

    @Autowired
    private PacienteRepository pacienteRepository;

    @Autowired
    private EnfermeroRepository enfermeroRepository;

    @Autowired
    private CamaRepository camaRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private HabitacionRepository habitacionRepository;

    @Autowired
    private NotificationService notificationService;

    // --- CAMAS CRUD ---
    @GetMapping("/camas")
    public ResponseEntity<APIResponse> findAllCamas(){
        var resp = camaService.FindAll();
        return new ResponseEntity<>(resp.getBody(), resp.getStatusCode());
    }

    @GetMapping("/camas/{id}")
    public ResponseEntity<APIResponse> getCama(@PathVariable Long id){
        APIResponse response = camaService.FindById(id);
        return new ResponseEntity<>(response, response.getStatus());
    }

    @PostMapping("/camas")
    public ResponseEntity<APIResponse> createCama(@RequestBody Cama cama){
        APIResponse respuesta = camaService.Create(cama);
        return new ResponseEntity<>(respuesta, respuesta.getStatus());
    }

    @PutMapping("/camas/{id}")
    public ResponseEntity<APIResponse> updateCama(@PathVariable Long id, @RequestBody Cama cama){
        APIResponse respuesta = camaService.Update(id, cama);
        return new ResponseEntity<>(respuesta, respuesta.getStatus());
    }

    @DeleteMapping("/camas/{id}")
    public ResponseEntity<APIResponse> deleteCama(@PathVariable Long id){
        APIResponse respuesta = camaService.Eliminar(id);
        return new ResponseEntity<>(respuesta, respuesta.getStatus());
    }

    // --- PACIENTES CRUD ---
    @GetMapping("/pacientes")
    public ResponseEntity<APIResponse> getPacientes(){
        try {
            List<Paciente> list = pacienteRepository.findAll();
            return new ResponseEntity<>(new APIResponse(list,false,"ok", HttpStatus.OK), HttpStatus.OK);
        } catch (Exception ex){
            ex.printStackTrace();
            return new ResponseEntity<>(new APIResponse(true,"error",HttpStatus.INTERNAL_SERVER_ERROR), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @GetMapping("/pacientes/{id}")
    public ResponseEntity<APIResponse> getPaciente(@PathVariable Long id){
        try {
            var opt = pacienteRepository.findById(id);
            if (opt.isPresent()){
                return new ResponseEntity<>(new APIResponse(opt.get(),false,"ok",HttpStatus.OK),HttpStatus.OK);
            }
            return new ResponseEntity<>(new APIResponse(true,"Paciente no encontrado",HttpStatus.OK),HttpStatus.OK);
        } catch (Exception ex){
            ex.printStackTrace();
            return new ResponseEntity<>(new APIResponse(true,"error",HttpStatus.INTERNAL_SERVER_ERROR),HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @PostMapping("/pacientes")
    public ResponseEntity<APIResponse> createPaciente(@RequestBody Paciente paciente){
        try {
            pacienteRepository.save(paciente);
            String randomPass = "123456"; //UUID.randomUUID().toString();
            BeanUser user = new BeanUser();
            user.setPassword(PasswordEncoder.encodePassword(randomPass));
            user.setCorreo(paciente.getCorreo());
            user.setRole(Role.PACIENTE);
            userRepository.save(user);
            return new ResponseEntity<>(new APIResponse(false,"Paciente creado",HttpStatus.OK),HttpStatus.OK);
        } catch (Exception ex){
            ex.printStackTrace();
            return new ResponseEntity<>(new APIResponse(true,"error",HttpStatus.INTERNAL_SERVER_ERROR),HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @PutMapping("/pacientes/{id}")
    public ResponseEntity<APIResponse> updatePaciente(@PathVariable Long id, @RequestBody Paciente p){
        try {
            var opt = pacienteRepository.findById(id);
            if (opt.isEmpty()) return new ResponseEntity<>(new APIResponse(true,"Paciente no encontrado",HttpStatus.OK),HttpStatus.OK);
            var db = opt.get();
            db.setNombre(p.getNombre());
            db.setApellido(p.getApellido());
            db.setEdad(p.getEdad());
            db.setTelefono(p.getTelefono());
            db.setDiagnostico(p.getDiagnostico());
            pacienteRepository.save(db);
            return new ResponseEntity<>(new APIResponse(false,"Paciente actualizado",HttpStatus.OK),HttpStatus.OK);
        } catch (Exception ex){
            ex.printStackTrace();
            return new ResponseEntity<>(new APIResponse(true,"error",HttpStatus.INTERNAL_SERVER_ERROR),HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @DeleteMapping("/pacientes/{id}")
    public ResponseEntity<APIResponse> deletePaciente(@PathVariable Long id){
        try {
            pacienteRepository.deleteById(id);
            return new ResponseEntity<>(new APIResponse(false,"Paciente eliminado",HttpStatus.OK),HttpStatus.OK);
        } catch (Exception ex){
            ex.printStackTrace();
            return new ResponseEntity<>(new APIResponse(true,"error",HttpStatus.INTERNAL_SERVER_ERROR),HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // --- ASIGNACIONES ---
    @PostMapping("/camas/{camaId}/asignarPaciente/{pacienteId}")
    public ResponseEntity<APIResponse> asignarPaciente(@PathVariable Long camaId, @PathVariable Long pacienteId){
        APIResponse respuesta = camaService.asignarPaciente(camaId, pacienteId);
        return new ResponseEntity<>(respuesta, respuesta.getStatus());
    }

    // --- ASIGNAR ENFERMERO A CAMA  VAMOS A OCUPAR ESTA
    @PostMapping("/camas/{camaId}/asignarEnfermero/{enfermeroId}")
    public ResponseEntity<APIResponse> asignarEnfermero(@PathVariable Long camaId, @PathVariable Long enfermeroId){
        APIResponse respuesta = camaService.asignarEnfermero(camaId, enfermeroId);
        return new ResponseEntity<>(respuesta, respuesta.getStatus());
    }

    // --- GENERAR QR ---
    @GetMapping("/camas/{camaId}/qr")
    public ResponseEntity<APIResponse> generarQr(@PathVariable Long camaId){
        APIResponse respuesta = camaService.generarQR(camaId);
        return new ResponseEntity<>(respuesta, respuesta.getStatus());
    }

    // --- REVOCAR DISPOSITIVO ---
    @PostMapping("/camas/{camaId}/revocarDispositivo")
    public ResponseEntity<APIResponse> revocarDispositivo(@PathVariable Long camaId){
        APIResponse respuesta = camaService.revocarDispositivoPaciente(camaId);
        return new ResponseEntity<>(respuesta, respuesta.getStatus());
    }

    // --- HABITACIONES CRUD (opcional) ---
    @GetMapping("/habitaciones")
    public ResponseEntity<APIResponse> getHabitaciones(){
        try {
            var list = habitacionRepository.findAll();
            return new ResponseEntity<>(new APIResponse(list,false,"ok",HttpStatus.OK),HttpStatus.OK);
        } catch (Exception ex){
            ex.printStackTrace();
            return new ResponseEntity<>(new APIResponse(true,"error",HttpStatus.INTERNAL_SERVER_ERROR),HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @PostMapping("/habitaciones")
    public ResponseEntity<APIResponse> createHabitacion(@RequestBody Habitacion h){
        try {
            habitacionRepository.save(h);
            return new ResponseEntity<>(new APIResponse(false,"Habitacion creada",HttpStatus.OK),HttpStatus.OK);
        } catch (Exception ex){
            ex.printStackTrace();
            return new ResponseEntity<>(new APIResponse(true,"error",HttpStatus.INTERNAL_SERVER_ERROR),HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @GetMapping("/habitaciones/{id}")
    public ResponseEntity<APIResponse> getHabitacion(@PathVariable Long id){
        try {
            var opt = habitacionRepository.findById(id);
            if (opt.isPresent()){
                return new ResponseEntity<>(new APIResponse(opt.get(),false,"ok",HttpStatus.OK),HttpStatus.OK);
            }
            return new ResponseEntity<>(new APIResponse(true,"Habitación no encontrada",HttpStatus.NOT_FOUND),HttpStatus.OK);
        } catch (Exception ex){
            ex.printStackTrace();
            return new ResponseEntity<>(new APIResponse(true,"error",HttpStatus.INTERNAL_SERVER_ERROR),HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @PutMapping("/habitaciones/{id}")
    public ResponseEntity<APIResponse> updateHabitacion(@PathVariable Long id, @RequestBody Habitacion h){
        try {
            var opt = habitacionRepository.findById(id);
            if (opt.isEmpty()) return new ResponseEntity<>(new APIResponse(true,"Habitación no encontrada",HttpStatus.NOT_FOUND),HttpStatus.OK);

            var db = opt.get();
            db.nombre = h.nombre;

            habitacionRepository.save(db);

            return new ResponseEntity<>(new APIResponse(false,"Habitación actualizada",HttpStatus.OK),HttpStatus.OK);
        } catch (Exception ex){
            ex.printStackTrace();
            return new ResponseEntity<>(new APIResponse(true,"error",HttpStatus.INTERNAL_SERVER_ERROR),HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @DeleteMapping("/habitaciones/{id}")
    public ResponseEntity<APIResponse> deleteHabitacion(@PathVariable Long id){
        try {
            habitacionRepository.deleteById(id);
            return new ResponseEntity<>(new APIResponse(false,"Habitación eliminada",HttpStatus.OK),HttpStatus.OK);
        } catch (Exception ex){
            ex.printStackTrace();
            return new ResponseEntity<>(new APIResponse(true,"error",HttpStatus.INTERNAL_SERVER_ERROR),HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }


    @GetMapping("/notificaciones")
    public ResponseEntity<APIResponse> verNotificaciones(){
        try {
            var list = notificationService.getNotificationsForCama(null);

            return new ResponseEntity<>(
                    new APIResponse(list, false, "Notificaciones obtenidas", HttpStatus.OK),
                    HttpStatus.OK
            );

        } catch (Exception ex){
            ex.printStackTrace();
            return new ResponseEntity<>(
                    new APIResponse(null, true, "error", HttpStatus.INTERNAL_SERVER_ERROR),
                    HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }

    @GetMapping("/notificaciones/cama/{camaId}")
    public ResponseEntity<APIResponse> verNotificacionesPorCama(@PathVariable Long camaId){
        try {
            var list = notificationService.getNotificationsForCama(camaId);
            return new ResponseEntity<>(new APIResponse(list,false,"ok",HttpStatus.OK),HttpStatus.OK);
        } catch (Exception ex){
            ex.printStackTrace();
            return new ResponseEntity<>(new APIResponse(true,"error",HttpStatus.INTERNAL_SERVER_ERROR),HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
