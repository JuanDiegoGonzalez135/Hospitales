package utez.edu.mx.backhospitales.auth;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import utez.edu.mx.backhospitales.Utils.APIResponse;
import utez.edu.mx.backhospitales.Utils.PasswordEncoder;
import utez.edu.mx.backhospitales.auth.dto.LoginRequestDTO;
import utez.edu.mx.backhospitales.models.BeanUser;
import utez.edu.mx.backhospitales.repositories.UserRepository;
import utez.edu.mx.backhospitales.security.jwt.JWTUtils;
import utez.edu.mx.backhospitales.security.jwt.UDService;

@Service
public class AuthServices {

        @Autowired
        private UserRepository userRepository;

        @Autowired
        private UDService udService;

        @Autowired
        private JWTUtils jwtUtils;

        @Transactional(readOnly = true)
        public APIResponse doLogin(LoginRequestDTO payload) {
            try {
                BeanUser found = userRepository.findByCorreo(payload.getCorreo()).orElse(null);
                if (found == null) return new APIResponse( true,"correo no encontrado", HttpStatus.NOT_FOUND);

                if (!PasswordEncoder.verifyPassword(payload.getPassword(), found.getPassword()))
                    return new APIResponse(true,"Las contrasenas no coniciden",  HttpStatus.BAD_REQUEST);

                UserDetails ud = udService.loadUserByUsername(found.getCorreo());
                String token = jwtUtils.generateToken(ud, found.getRole().name());
                return new APIResponse(token,false,"Operacion exitosa",   HttpStatus.OK);
            } catch (Exception ex) {
                ex.printStackTrace();
                return new APIResponse(
                        true,
                        "Error al iniciar sesion",
                        HttpStatus.INTERNAL_SERVER_ERROR
                );
            }
        }
}