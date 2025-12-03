package utez.edu.mx.backhospitales.services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import utez.edu.mx.backhospitales.Utils.APIResponse;
import utez.edu.mx.backhospitales.Utils.PasswordEncoder;
import utez.edu.mx.backhospitales.models.*;
import utez.edu.mx.backhospitales.models.dtos.CrearEnfermeroDTO;
import utez.edu.mx.backhospitales.repositories.*;

import java.util.*;

@Service
public class EnfermeroService {
    @Autowired
    private EnfermeroRepository enfermeroRepository;

    @Autowired
    private CamaRepository camaRepository;

    @Autowired
    private DispositivoEnfermeroRepository dispositivoRepo;

    @Autowired
    private UserRepository userRepository;

    public APIResponse FindAll(){
        try {
            List<Enfermero> lista = enfermeroRepository.findAll();
            return new APIResponse(lista,false, "peticion exitosa :D" , HttpStatus.OK);
        } catch (Exception ex){
            ex.printStackTrace();
            return new APIResponse(true,"Error interno",HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    public APIResponse FindById(Long id){
        try {
            Optional<Enfermero> found = enfermeroRepository.findById(id);
            if (found.isPresent()){
                return new APIResponse(found.get(), false, "Operacion exitosa :D", HttpStatus.OK);
            }
            return new APIResponse( true, "Enfermero no encontrado", HttpStatus.OK);
        } catch (Exception ex){
            ex.printStackTrace();
            return new APIResponse(true ,"Ha ocurrido un error", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    public APIResponse Create(CrearEnfermeroDTO dto) {
        try {

            // 1. Validar que el correo no exista
            Optional<BeanUser> existing = userRepository.findByCorreo(dto.getCorreo());
            if (existing.isPresent()) {
                return new APIResponse(true,"El correo ya está registrado en el sistema",HttpStatus.BAD_REQUEST);
            }

            // 2. Convertir DTO → entidad Enfermero
            Enfermero enfermero = new Enfermero();
            enfermero.setNombre(dto.getNombre());
            enfermero.setApellido(dto.getApellido());
            enfermero.setTelefono(dto.getTelefono());
            enfermero.setCorreo(dto.getCorreo());
            enfermero.setPasswordTemporal(dto.getPassword());
            enfermeroRepository.save(enfermero);

            // 3. Crear el usuario del enfermero
            BeanUser user = new BeanUser();
            user.setCorreo(dto.getCorreo());
            user.setPassword(PasswordEncoder.encodePassword(dto.getPassword()));
            user.setRole(Role.ENFERMERO);

            userRepository.save(user);

            return new APIResponse(false,"Enfermero y usuario creados correctamente",HttpStatus.CREATED);

        } catch (Exception ex) {
            ex.printStackTrace();
            return new APIResponse(true,"Error al registrar el enfermero",HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    public APIResponse Update(Long id, Enfermero act){
        try {
            Optional<Enfermero> found = enfermeroRepository.findById(id);
            if (found.isEmpty()){
                return new APIResponse(true, "No se encontro el enfermero", HttpStatus.INTERNAL_SERVER_ERROR);
            }
            Enfermero e = found.get();
            e.setNombre(act.getNombre());
            e.setApellido(act.getApellido());
            e.setCorreo(act.getCorreo());
            e.setTelefono(act.getTelefono());
            enfermeroRepository.save(e);
            return new APIResponse(false, "Enfermero actualizado con exito", HttpStatus.OK);
        } catch (Exception ex){
            ex.printStackTrace();
            return new APIResponse(true, "Error al actualizar el enfermero", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    public APIResponse Eliminar(Long id){
        try {
            if (id == null){
                return new APIResponse(true, "No se encontro el enfermero", HttpStatus.INTERNAL_SERVER_ERROR);
            }
            enfermeroRepository.deleteById(id);
            return new APIResponse(false, "Operacion exitosa", HttpStatus.OK);
        } catch (Exception ex){
            ex.printStackTrace();
            return new APIResponse(true, "Error al eliminar el enfermero", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    public APIResponse setNotificaciones(Long idEnfermero, boolean activar){
        try {
            Optional<Enfermero> opt = enfermeroRepository.findById(idEnfermero);
            if (opt.isEmpty()){
                return new APIResponse(true, "Enfermero no encontrado", HttpStatus.OK);
            }
            Enfermero e = opt.get();
            e.setNotificacionesActivas(activar);
            enfermeroRepository.save(e);
            return new APIResponse(false, "Configuración guardada", HttpStatus.OK);
        } catch (Exception ex){
            ex.printStackTrace();
            return new APIResponse(true, "Error interno", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    public APIResponse verCamasAsignadas(Long idEnfermero){
        try {
            Optional<Enfermero> opt = enfermeroRepository.findById(idEnfermero);
            if (opt.isEmpty()){
                return new APIResponse(true, "Enfermero no encontrado", HttpStatus.OK);
            }
            Enfermero e = opt.get();
            Set<Cama> camas = e.getCamas();
            return new APIResponse(camas, false, "Camas obtenidas", HttpStatus.OK);
        } catch (Exception ex){
            ex.printStackTrace();
            return new APIResponse(true, "Error interno", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    public APIResponse verDatosBasicosPaciente(Long camaId){
        try {
            Optional<Cama> opt = camaRepository.findById(camaId);
            if (opt.isEmpty()){
                return new APIResponse(true, "Cama no encontrada", HttpStatus.OK);
            }
            Cama cama = opt.get();
            if (cama.getPaciente() == null){
                return new APIResponse(true, "No hay paciente asignado", HttpStatus.OK);
            }
            Paciente p = cama.getPaciente();
            Map<String,Object> data = new HashMap<>();
            data.put("id", p.getId());
            data.put("nombre", p.getNombre());
            data.put("apellido", p.getApellido());
            data.put("edad", p.getEdad());
            data.put("diagnostico", p.getDiagnostico());
            return new APIResponse(data, false, "Datos del paciente", HttpStatus.OK);
        } catch (Exception ex){
            ex.printStackTrace();
            return new APIResponse(true, "Error interno", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    public APIResponse registrarToken(Long idEnfermero, String token) {
        try {
            Optional<Enfermero> enfOpt = enfermeroRepository.findById(idEnfermero);
            if (enfOpt.isEmpty()) {
                return new APIResponse(true, "Enfermero no encontrado", HttpStatus.NOT_FOUND);
            }

            Enfermero enf = enfOpt.get();

            Optional<DispositivoEnfermero> existing = dispositivoRepo.findByEnfermeroId(idEnfermero);

            DispositivoEnfermero dispositivo;

            if (existing.isPresent()) {
                dispositivo = existing.get();
                dispositivo.setToken(token);
            } else {
                dispositivo = new DispositivoEnfermero(token, enf);
            }

            dispositivoRepo.save(dispositivo);

            return new APIResponse(false, "Token registrado correctamente", HttpStatus.OK);

        } catch (Exception e) {
            e.printStackTrace();
            return new APIResponse(true, "Error registrando token", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

}
