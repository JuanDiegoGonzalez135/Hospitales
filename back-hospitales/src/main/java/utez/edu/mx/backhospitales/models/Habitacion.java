package utez.edu.mx.backhospitales.models;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;

import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "habitaciones")
public class Habitacion {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    public Long id;

    @Column(name = "nombre")
    public String nombre;

    @JsonIgnore
    @OneToMany(mappedBy = "habitacion", cascade = CascadeType.ALL)
    public Set<Cama> camas = new HashSet<>();

    public Habitacion() {}

    public Habitacion(Long id, String nombre) {
        this.id = id;
        this.nombre = nombre;
    }

    public Long getId() { return id; }

    public void setId(Long id) { this.id = id; }

    public String getNombre() { return nombre; }

    public void setNombre(String nombre) { this.nombre = nombre; }

    public Set<Cama> getCamas() { return camas; }

    public void setCamas(Set<Cama> camas) { this.camas = camas; }
}