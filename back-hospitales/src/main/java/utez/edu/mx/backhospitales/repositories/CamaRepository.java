package utez.edu.mx.backhospitales.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import utez.edu.mx.backhospitales.models.Cama;

import java.util.Optional;

@Repository
public interface CamaRepository extends JpaRepository<Cama, Long> {
    Optional<Cama> findByCodigo(String codigo);

}