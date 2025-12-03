package utez.edu.mx.backhospitales.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import utez.edu.mx.backhospitales.models.Habitacion;

public interface HabitacionRepository extends JpaRepository<Habitacion, Long> {}