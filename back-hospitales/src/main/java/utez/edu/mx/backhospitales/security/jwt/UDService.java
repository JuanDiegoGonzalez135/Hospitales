package utez.edu.mx.backhospitales.security.jwt;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import utez.edu.mx.backhospitales.models.BeanUser;
import utez.edu.mx.backhospitales.repositories.UserRepository;

import java.util.Collections;

//Tercer paso: Crear nuestro servicio de gestión de autoridades
@Service
public class UDService implements UserDetailsService {
    @Autowired
    private UserRepository userRepository;
    @Override
    public UserDetails loadUserByUsername(String correo) throws UsernameNotFoundException {
        BeanUser found = userRepository.findByCorreo(correo).orElse(null);
        if (found == null) throw new UsernameNotFoundException("Correo no encontrado");
        GrantedAuthority authority=new SimpleGrantedAuthority("ROLE_" + found.getRole());

        return new User(
                found.getCorreo(),
                found.getPassword(),
                Collections.singleton(authority)
        );
    }
}

