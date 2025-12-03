package utez.edu.mx.backhospitales.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import utez.edu.mx.backhospitales.models.Paciente;

public interface PacienteRepository extends JpaRepository<Paciente, Long> {}
