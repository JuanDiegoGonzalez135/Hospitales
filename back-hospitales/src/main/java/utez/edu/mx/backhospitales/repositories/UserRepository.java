package utez.edu.mx.backhospitales.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import utez.edu.mx.backhospitales.models.BeanUser;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<BeanUser, Long> {
    Optional<BeanUser> findByCorreoAndPassword(String correo,String password);
    Optional<BeanUser> findByCorreo(String correo);


}
