package utez.edu.mx.backhospitales.models;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import jakarta.validation.constraints.Pattern;

import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "enfermeros")
public class Enfermero {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    public Long id;

    @Column(name = "nombre", nullable = false)
    public String nombre;

    @Column(name = "apellido", nullable = false)
    public String apellido;

    @Column(name = "telefono", unique = true, nullable = false)
    public String telefono;

    @Pattern(
            regexp = "^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+$",
            message = "El correo no cumple con el formato válido"
    )
    @Column(name = "correo",unique = true, nullable = false)
    public String correo;

    @Column(name = "password_temporal", nullable = true)
    @Transient
    private String passwordTemporal;


    @Column(name = "notificaciones_activas")
    public Boolean notificacionesActivas = true;

    @ManyToMany(mappedBy = "enfermeros")
    @JsonIgnore
    public Set<Cama> camas = new HashSet<>();

    public Enfermero() {}

    public Enfermero(Long id, String nombre, String apellido, String telefono, String correo, String passwordTemporal, Boolean notificacionesActivas, Set<Cama> camas) {
        this.id = id;
        this.nombre = nombre;
        this.apellido = apellido;
        this.telefono = telefono;
        this.correo = correo;
        this.passwordTemporal = passwordTemporal;
        this.notificacionesActivas = notificacionesActivas;
        this.camas = camas;
    }

    public Long getId() { return id; }

    public void setId(Long id) { this.id = id; }

    public String getNombre() { return nombre; }

    public void setNombre(String nombre) { this.nombre = nombre; }

    public String getApellido() { return apellido; }

    public void setApellido(String apellido) { this.apellido = apellido; }

    public String getTelefono() { return telefono; }

    public void setTelefono(String telefono) { this.telefono = telefono; }

    public String getCorreo() { return correo; }

    public void setCorreo(String correo) { this.correo = correo; }

    public Boolean getNotificacionesActivas() { return notificacionesActivas; }

    public void setNotificacionesActivas(Boolean notificacionesActivas) { this.notificacionesActivas = notificacionesActivas; }

    public Set<Cama> getCamas() { return camas; }

    public void setCamas(Set<Cama> camas) { this.camas = camas; }

    public String getPasswordTemporal() {
        return passwordTemporal;
    }

    public void setPasswordTemporal(String passwordTemporal) {
        this.passwordTemporal = passwordTemporal;
    }
}
