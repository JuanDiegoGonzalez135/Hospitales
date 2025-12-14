package utez.edu.mx.backhospitales.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import utez.edu.mx.backhospitales.models.Enfermero;

import java.util.Optional;

public interface EnfermeroRepository extends JpaRepository<Enfermero, Long> {
    Optional<Enfermero> findByCorreo(String correo);
}