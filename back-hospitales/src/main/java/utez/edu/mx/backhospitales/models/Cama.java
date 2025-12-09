package utez.edu.mx.backhospitales.models;

import jakarta.persistence.*;
import jakarta.validation.constraints.Pattern;

import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "camas")
public class Cama {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    public Long id;

    @Column(name = "codigo", unique = true)
    public String codigo; // identificador visible en QR (ej: CAMA-001)

    @Column(name = "numero")
    public String numero;

    @ManyToOne
    @JoinColumn(name = "habitacion_id")
    public Habitacion habitacion;

    @OneToOne
    @JoinColumn(name = "paciente_id")
    public Paciente paciente; // puede ser null si libre

    @ManyToMany
    @JoinTable(name = "cama_enfermero",
            joinColumns = @JoinColumn(name = "cama_id"),
            inverseJoinColumns = @JoinColumn(name = "enfermero_id"))
    public Set<Enfermero> enfermeros = new HashSet<>();

    public Cama() {}

    public Cama(Long id, String codigo, String numero) {
        this.id = id;
        this.codigo = codigo;
        this.numero = numero;
    }

    public Long getId() { return id; }

    public void setId(Long id) { this.id = id; }

    public String getCodigo() { return codigo; }

    public void setCodigo(String codigo) { this.codigo = codigo; }

    public String getNumero() { return numero; }

    public void setNumero(String numero) { this.numero = numero; }

    public Habitacion getHabitacion() { return habitacion; }

    public void setHabitacion(Habitacion habitacion) { this.habitacion = habitacion; }

    public Paciente getPaciente() { return paciente; }

    public void setPaciente(Paciente paciente) { this.paciente = paciente; }

    public Set<Enfermero> getEnfermeros() { return enfermeros; }

    public void setEnfermeros(Set<Enfermero> enfermeros) { this.enfermeros = enfermeros; }
}