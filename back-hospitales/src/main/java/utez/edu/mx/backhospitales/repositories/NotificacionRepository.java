package utez.edu.mx.backhospitales.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import utez.edu.mx.backhospitales.models.Notificacion;

import java.util.List;

public interface NotificacionRepository extends JpaRepository<Notificacion, Long> {
    List<Notificacion> findByCamaIdOrderByFechaDesc(Long camaId);
}