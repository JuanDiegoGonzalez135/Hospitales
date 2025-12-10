package utez.edu.mx.backhospitales.services;

import com.google.zxing.BarcodeFormat;
import com.google.zxing.EncodeHintType;
import com.google.zxing.MultiFormatWriter;
import com.google.zxing.client.j2se.MatrixToImageWriter;
import com.google.zxing.common.BitMatrix;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import utez.edu.mx.backhospitales.Utils.APIResponse;
import utez.edu.mx.backhospitales.models.Cama;
import utez.edu.mx.backhospitales.models.DispositivoPaciente;
import utez.edu.mx.backhospitales.models.Enfermero;
import utez.edu.mx.backhospitales.models.Paciente;
import utez.edu.mx.backhospitales.repositories.CamaRepository;
import utez.edu.mx.backhospitales.repositories.DispositivoPacienteRepository;
import utez.edu.mx.backhospitales.repositories.EnfermeroRepository;
import utez.edu.mx.backhospitales.repositories.PacienteRepository;

import java.io.ByteArrayOutputStream;
import java.util.*;

@Service
public class CamaService {
    @Autowired
    private CamaRepository camaRepository;

    @Autowired
    private PacienteRepository pacienteRepository;

    @Autowired
    private EnfermeroRepository enfermeroRepository;

    @Autowired
    private DispositivoPacienteRepository dispositivoPacienteRepository;

    public org.springframework.http.ResponseEntity<APIResponse> FindAll(){
        try {
            List<Cama> lista = camaRepository.findAll();
            return new org.springframework.http.ResponseEntity<>(new APIResponse(lista,false, "peticion exitosa :D" , HttpStatus.OK), HttpStatus.OK);
        } catch (Exception ex){
            ex.printStackTrace();
            return new org.springframework.http.ResponseEntity<>(new APIResponse(true,"Error interno", HttpStatus.INTERNAL_SERVER_ERROR),HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    public APIResponse FindById(Long id){
        try {
            Optional<Cama> found = camaRepository.findById(id);
            if (found.isPresent()){
                return new APIResponse(found.get(), false, "Operacion exitosa :D", HttpStatus.OK);
            }
            return new APIResponse( true, "Cama no encontrada", HttpStatus.OK);
        } catch (Exception ex){
            ex.printStackTrace();
            return new APIResponse(true ,"Ha ocurrido un error", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    public APIResponse Create(Cama cama){
        try {
            if (cama.getCodigo() == null || cama.getCodigo().isEmpty()){
                cama.setCodigo("CAMA-" + UUID.randomUUID().toString().substring(0,8).toUpperCase());
            }
            camaRepository.save(cama);
            return new APIResponse(false, "Cama guardada con exito", HttpStatus.OK);
        } catch (Exception ex){
            ex.printStackTrace();
            return new APIResponse(true, "Error al registrar la cama", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    public APIResponse Update(Long id, Cama act){
        try {
            Optional<Cama> found = camaRepository.findById(id);
            if (found.isEmpty()){
                return new APIResponse(true, "No se encontro la cama", HttpStatus.INTERNAL_SERVER_ERROR);
            }
            Cama cama = found.get();
            cama.setNumero(act.getNumero());
            cama.setCodigo(act.getCodigo());
            cama.setHabitacion(act.getHabitacion());
            camaRepository.save(cama);
            return new APIResponse(false, "Cama actualizada con exito", HttpStatus.OK);
        } catch (Exception ex){
            ex.printStackTrace();
            return new APIResponse(true, "Error al actualizar la cama", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    public APIResponse Eliminar(Long id){
        try {
            if (id == null){
                return new APIResponse(true, "No se encontro la cama", HttpStatus.INTERNAL_SERVER_ERROR);
            }
            camaRepository.deleteById(id);
            return new APIResponse(false, "Operacion exitosa", HttpStatus.OK);
        } catch (Exception ex){
            ex.printStackTrace();
            return new APIResponse(true, "Error al eliminar la cama", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    public APIResponse asignarPaciente(Long idCama, Long idPaciente){
        try {
            Optional<Cama> optC = camaRepository.findById(idCama);
            Optional<Paciente> optP = pacienteRepository.findById(idPaciente);
            if (optC.isEmpty() || optP.isEmpty()){
                return new APIResponse(true, "Cama o paciente no encontrado", HttpStatus.INTERNAL_SERVER_ERROR);
            }
            Cama cama = optC.get();
            Paciente paciente = optP.get();
            cama.setPaciente(paciente);
            camaRepository.save(cama);
            return new APIResponse(false, "Paciente asignado a cama", HttpStatus.OK);
        } catch (Exception ex){
            ex.printStackTrace();
            return new APIResponse(true, "Error al asignar paciente", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    public APIResponse asignarEnfermero(Long idCama, Long idEnfermero){
        try {
            Optional<Cama> optC = camaRepository.findById(idCama);
            Optional<Enfermero> optE = enfermeroRepository.findById(idEnfermero);
            if (optC.isEmpty() || optE.isEmpty()){
                return new APIResponse(true, "Cama o enfermero no encontrado", HttpStatus.INTERNAL_SERVER_ERROR);
            }
            Cama cama = optC.get();
            Enfermero enfermero = optE.get();
            cama.getEnfermeros().add(enfermero);
            enfermero.getCamas().add(cama);
            camaRepository.save(cama);
            enfermeroRepository.save(enfermero);
            return new APIResponse(false, "Enfermero asignado a cama", HttpStatus.OK);
        } catch (Exception ex){
            ex.printStackTrace();
            return new APIResponse(true, "Error al asignar enfermero", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    public APIResponse generarQR(Long camaId){
        try {
            Optional<Cama> opt = camaRepository.findById(camaId);
            if (opt.isEmpty()) {
                return new APIResponse(true, "Cama no encontrada", HttpStatus.INTERNAL_SERVER_ERROR);
            }

            Cama cama = opt.get();

            // Construir un JSON con toda la info de la cama
            Map<String, Object> qrData = new LinkedHashMap<>();

            qrData.put("id", cama.getId());
            qrData.put("codigo", cama.getCodigo());
            qrData.put("numero", cama.getNumero());

            Map<String, Object> habitacion = new LinkedHashMap<>();
            habitacion.put("id", cama.getHabitacion().getId());
            habitacion.put("nombre", cama.getHabitacion().getNombre());
            qrData.put("habitacion", habitacion);

            // Estado
            qrData.put("estado", cama.getPaciente() != null ? "Ocupada" : "Libre");

            // Paciente
            if (cama.getPaciente() != null) {
                Paciente p = cama.getPaciente();
                Map<String, Object> paciente = new LinkedHashMap<>();
                paciente.put("id", p.getId());
                paciente.put("nombre", p.getNombre());
                paciente.put("apellido", p.getApellido());
                paciente.put("edad", p.getEdad());
                paciente.put("telefono", p.getTelefono());
                paciente.put("correo", p.getCorreo());
                paciente.put("diagnostico", p.getDiagnostico());
                qrData.put("paciente", paciente);
            } else {
                qrData.put("paciente", null);
            }

            // Enfermeros
            List<Map<String, Object>> enfermerosList = new ArrayList<>();
            for (Enfermero e : cama.getEnfermeros()) {
                Map<String, Object> enf = new LinkedHashMap<>();
                enf.put("id", e.getId());
                enf.put("nombre", e.getNombre());
                enf.put("apellido", e.getApellido());
                enf.put("telefono", e.getTelefono());
                enfermerosList.add(enf);
            }
            qrData.put("enfermeros", enfermerosList);

            // Convertir JSON a String
            String qrText = new com.fasterxml.jackson.databind.ObjectMapper()
                    .writeValueAsString(qrData);

            // Generar la imagen del QR
            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            int size = 400;

            Map<EncodeHintType, Object> hints = new HashMap<>();
            hints.put(EncodeHintType.CHARACTER_SET, "UTF-8");

            BitMatrix bitMatrix = new MultiFormatWriter()
                    .encode(qrText, BarcodeFormat.QR_CODE, size, size, hints);

            MatrixToImageWriter.writeToStream(bitMatrix, "PNG", baos);
            byte[] bytes = baos.toByteArray();
            String base64 = Base64.getEncoder().encodeToString(bytes);

            Map<String, Object> resp = new HashMap<>();
            resp.put("base64", base64);
            resp.put("mime", "image/png");
            resp.put("contenido", qrText);

            return new APIResponse(resp, false, "QR generado", HttpStatus.OK);

        } catch (Exception ex) {
            ex.printStackTrace();
            return new APIResponse(true, "Error generando QR", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }


    public APIResponse revocarDispositivoPaciente(Long camaId){
        try {
            var opt = dispositivoPacienteRepository.findByCamaId(camaId);
            if (opt.isEmpty()){
                return new APIResponse(true, "No hay dispositivo vinculado a esa cama", HttpStatus.OK);
            }
            DispositivoPaciente dp = opt.get();
            dp.setVinculado(false);
            dp.setCama(null);
            dp.setPaciente(null);
            dispositivoPacienteRepository.save(dp);
            return new APIResponse(false, "Dispositivo revocado", HttpStatus.OK);
        } catch (Exception ex){
            ex.printStackTrace();
            return new APIResponse(true, "Error al revocar dispositivo", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}