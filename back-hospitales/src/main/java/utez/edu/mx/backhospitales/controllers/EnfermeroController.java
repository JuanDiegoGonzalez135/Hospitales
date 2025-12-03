package utez.edu.mx.backhospitales.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import utez.edu.mx.backhospitales.Utils.APIResponse;
import utez.edu.mx.backhospitales.models.Enfermero;
import utez.edu.mx.backhospitales.models.dtos.CrearEnfermeroDTO;
import utez.edu.mx.backhospitales.services.EnfermeroService;

import java.util.Map;


@RestController
@CrossOrigin("*")
@RequestMapping("/api/hospitales/enfermero")
public class EnfermeroController {

    @Autowired
    private EnfermeroService enfermeroService;

    @GetMapping("")
    public ResponseEntity<APIResponse> all(){
        APIResponse resp = enfermeroService.FindAll();
        return new ResponseEntity<>(resp, resp.getStatus());
    }

    @GetMapping("/{id}")
    public ResponseEntity<APIResponse> get(@PathVariable Long id){
        APIResponse resp = enfermeroService.FindById(id);
        return new ResponseEntity<>(resp, resp.getStatus());
    }

    @PostMapping("")
    public ResponseEntity<APIResponse> create(@RequestBody CrearEnfermeroDTO dto){
        APIResponse resp = enfermeroService.Create(dto);
        return new ResponseEntity<>(resp, resp.getStatus());
    }

    @PutMapping("/{id}")
    public ResponseEntity<APIResponse> update(@PathVariable Long id, @RequestBody Enfermero e){
        APIResponse resp = enfermeroService.Update(id, e);
        return new ResponseEntity<>(resp, resp.getStatus());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<APIResponse> delete(@PathVariable Long id){
        APIResponse resp = enfermeroService.Eliminar(id);
        return new ResponseEntity<>(resp, resp.getStatus());
    }

    @PostMapping("/{id}/notificaciones/{activar}")
    public ResponseEntity<APIResponse> setNotificaciones(@PathVariable Long id, @PathVariable Boolean activar){
        APIResponse resp = enfermeroService.setNotificaciones(id, activar);
        return new ResponseEntity<>(resp, resp.getStatus());
    }

    @GetMapping("/{id}/camas")
    public ResponseEntity<APIResponse> camasAsignadas(@PathVariable Long id){
        APIResponse resp = enfermeroService.verCamasAsignadas(id);
        return new ResponseEntity<>(resp, resp.getStatus());
    }

    @GetMapping("/cama/{camaId}/paciente")
    public ResponseEntity<APIResponse> datosPaciente(@PathVariable Long camaId){
        APIResponse resp = enfermeroService.verDatosBasicosPaciente(camaId);
        return new ResponseEntity<>(resp, resp.getStatus());
    }

    @PostMapping("/registrar-token/{idEnfermero}")
    public ResponseEntity<APIResponse> registrarToken(
            @PathVariable Long idEnfermero,
            @RequestBody Map<String, String> body) {

        String token = body.get("token");
        APIResponse response = enfermeroService.registrarToken(idEnfermero, token);

        return new ResponseEntity<>(response, response.getStatus());
    }
}
