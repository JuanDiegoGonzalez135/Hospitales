package utez.edu.mx.backhospitales.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.HttpStatus;
import utez.edu.mx.backhospitales.Utils.APIResponse;
import utez.edu.mx.backhospitales.services.PacienteService;

@RestController
@CrossOrigin("*")
@RequestMapping("/api/hospitales/paciente")
public class PacienteController {

    @Autowired
    private PacienteService pacienteService;

    // Vincular app con QR: body { "deviceId": "...", "codigoCama": "CAMA-XXXX" }
    @PostMapping("/vincular/")
    public ResponseEntity<APIResponse> vincular(@RequestBody java.util.Map<String,String> body){
        String deviceId = body.get("deviceId");
        String codigoCama = body.get("codigoCama");
        APIResponse resp = pacienteService.vincularDispositivo(deviceId, codigoCama);
        return new ResponseEntity<>(resp, resp.getStatus());
    }

    // Desvincular app con QR:
    @PostMapping("/desvincular/{idCama}/")
    public ResponseEntity<APIResponse> desvincular(@PathVariable Long idCama){
        APIResponse resp = pacienteService.desvincularCama(idCama);
        return new ResponseEntity<>(resp, resp.getStatus());
    }

    // Endpoint para presionar AYUDA: /api/paciente/ayuda/{idCama}
    @PostMapping("/ayuda/{idCama}/")
    public ResponseEntity<APIResponse> ayuda(@PathVariable Long idCama){
        APIResponse resp = pacienteService.solicitarAyuda(idCama);
        return new ResponseEntity<>(resp, resp.getStatus());
    }
}

