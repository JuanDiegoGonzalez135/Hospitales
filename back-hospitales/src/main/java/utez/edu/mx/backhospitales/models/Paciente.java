package utez.edu.mx.backhospitales.models;

import jakarta.persistence.*;

@Entity
@Table(name = "pacientes")
public class Paciente {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    public Long id;

    @Column(name = "nombre")
    public String nombre;

    @Column(name = "apellido")
    public String apellido;

    @Column(name = "edad")
    public Integer edad;

    @Column(name = "telefono")
    public String telefono;

    @Column(name = "correo")
    public String correo;

    @Column(name = "diagnostico")
    public String diagnostico;

    public Paciente() {}

    public Paciente(Long id, String nombre, String apellido, Integer edad, String telefono, String correo, String diagnostico) {
        this.id = id;
        this.nombre = nombre;
        this.apellido = apellido;
        this.edad = edad;
        this.telefono = telefono;
        this.correo = correo;
        this.diagnostico = diagnostico;
    }

    public String getCorreo() {
        return correo;
    }

    public void setCorreo(String correo) {
        this.correo = correo;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) { this.id = id; }

    public String getNombre() {
        return nombre;
    }

    public void setNombre(String nombre) { this.nombre = nombre; }

    public String getApellido() {
        return apellido;
    }

    public void setApellido(String apellido) { this.apellido = apellido; }

    public Integer getEdad() {
        return edad;
    }

    public void setEdad(Integer edad) { this.edad = edad; }

    public String getTelefono() {
        return telefono;
    }

    public void setTelefono(String telefono) { this.telefono = telefono; }

    public String getDiagnostico() {
        return diagnostico;
    }

    public void setDiagnostico(String diagnostico) { this.diagnostico = diagnostico; }
}
