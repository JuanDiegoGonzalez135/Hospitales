package utez.edu.mx.backhospitales.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
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

    @PostMapping("/device-token")
    public ResponseEntity<APIResponse> registrarToken(
            @RequestBody Map<String, String> body) {

        String token = body.get("token");
        String strId = body.get("enfermeroId");

        if (token == null || token.isBlank()) {
            return ResponseEntity
                    .badRequest()
                    .body(new APIResponse(true, "Token vacío o nulo", HttpStatus.BAD_REQUEST));
        }

        if (strId == null || strId.isBlank()) {
            return ResponseEntity
                    .badRequest()
                    .body(new APIResponse(true, "Id de enfermero faltante", HttpStatus.BAD_REQUEST));
        }

        Long enfermeroId = Long.parseLong(strId);

        var resp = enfermeroService.registrarToken(enfermeroId, token);
        return new ResponseEntity<>(resp, resp.getStatus());
    }

}
