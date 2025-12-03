package utez.edu.mx.backhospitales.auth;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import utez.edu.mx.backhospitales.Utils.APIResponse;
import utez.edu.mx.backhospitales.auth.dto.LoginRequestDTO;
import utez.edu.mx.backhospitales.models.BeanUser;


@RestController
@RequestMapping("/api/auth")
public class AuthController {
    @Autowired
    private AuthServices authService;

    @PostMapping("")
    public ResponseEntity<APIResponse> doLogin(@RequestBody LoginRequestDTO payload){
        APIResponse response = authService.doLogin(payload);
        return new ResponseEntity<>(response,response.getStatus());
    }
}