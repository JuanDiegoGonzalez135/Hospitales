package utez.edu.mx.backhospitales.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import utez.edu.mx.backhospitales.models.DispositivoPaciente;
import utez.edu.mx.backhospitales.models.Paciente;

import java.util.List;
import java.util.Optional;

public interface DispositivoPacienteRepository extends JpaRepository<DispositivoPaciente, Long> {
    Optional<DispositivoPaciente> findByDeviceId(String deviceId);
    Optional<DispositivoPaciente> findByCamaId(Long camaId);
    List<DispositivoPaciente> findByPaciente(Paciente paciente); 

}