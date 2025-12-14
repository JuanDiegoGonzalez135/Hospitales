package utez.edu.mx.backhospitales.repositories;

import org.springframework.data.domain.Example;
import org.springframework.data.jpa.repository.JpaRepository;
import utez.edu.mx.backhospitales.models.DispositivoEnfermero;

import java.util.List;
import java.util.Optional;

public interface DispositivoEnfermeroRepository extends JpaRepository<DispositivoEnfermero, Long> {
    List<DispositivoEnfermero> findAllByEnfermeroId(Long id);

    Optional<DispositivoEnfermero> findByEnfermeroId(Long id);
}