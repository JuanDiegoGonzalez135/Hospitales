package utez.edu.mx.backhospitales.Utils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import utez.edu.mx.backhospitales.models.BeanUser;
import utez.edu.mx.backhospitales.models.Role;
import utez.edu.mx.backhospitales.repositories.UserRepository;
import utez.edu.mx.backhospitales.Utils.PasswordEncoder;

@Configuration
public class AdminInitializer {

    @Autowired
    private UserRepository userRepository;

    @Bean
    public ApplicationRunner initAdminUser() {
        return args -> {
            String adminEmail = "admin@hospital.com";

            // ¿Ya existe un admin?
            boolean exists = userRepository.findByCorreo(adminEmail).isPresent();

            if (!exists) {
                BeanUser admin = new BeanUser();
                admin.setCorreo(adminEmail);
                admin.setPassword(PasswordEncoder.encodePassword("admin123")); // contraseña segura
                admin.setRole(Role.ADMIN);

                userRepository.save(admin);
                System.out.println("✔ ADMIN creado automáticamente");
            } else {
                System.out.println("✔ ADMIN ya existe, no se crea otro");
            }
        };
    }
}
