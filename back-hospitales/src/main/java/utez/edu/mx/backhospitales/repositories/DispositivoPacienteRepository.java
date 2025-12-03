package utez.edu.mx.backhospitales.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import utez.edu.mx.backhospitales.models.DispositivoPaciente;

import java.util.Optional;

public interface DispositivoPacienteRepository extends JpaRepository<DispositivoPaciente, Long> {
    Optional<DispositivoPaciente> findByDeviceId(String deviceId);
    Optional<DispositivoPaciente> findByCamaId(Long camaId);
}