package utez.edu.mx.backhospitales.repositories;


import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import utez.edu.mx.backhospitales.models.Paciente;

import java.util.Optional;

public interface PacienteRepository extends JpaRepository<Paciente, Long> {
    
    @Query(value = "SELECT * FROM pacientes p ORDER BY p.id DESC LIMIT 1", nativeQuery = true)
    Paciente findLastCreatedPatient();

    Optional<Paciente> findByCorreo(String correo);

}
