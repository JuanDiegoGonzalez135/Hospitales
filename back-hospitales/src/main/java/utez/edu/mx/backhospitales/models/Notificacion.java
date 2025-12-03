package utez.edu.mx.backhospitales.models;

import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "notificaciones")
public class Notificacion {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    public Long id;

    @ManyToOne
    @JoinColumn(name = "cama_id")
    public Cama cama;

    @ManyToOne
    @JoinColumn(name = "paciente_id")
    public Paciente paciente;

    @Column(name = "fecha")
    public LocalDateTime fecha;

    @Column(name = "leida")
    public Boolean leida = false;

    @Column(name = "enviada_a_isla")
    public Boolean enviadaAIsla = false;

    @Column(name = "enviada_a_enfermero")
    public Boolean enviadaAEnfermero = false;

    @Column(name = "mensaje")
    public String mensaje;

    public Notificacion() {}

    public Notificacion(Long id, Cama cama, Paciente paciente, LocalDateTime fecha, Boolean leida, Boolean enviadaAIsla, Boolean enviadaAEnfermero, String mensaje) {
        this.id = id;
        this.cama = cama;
        this.paciente = paciente;
        this.fecha = fecha;
        this.leida = leida;
        this.enviadaAIsla = enviadaAIsla;
        this.enviadaAEnfermero = enviadaAEnfermero;
        this.mensaje = mensaje;
    }

    public Long getId() { return id; }

    public void setId(Long id) { this.id = id; }

    public Cama getCama() { return cama; }

    public void setCama(Cama cama) { this.cama = cama; }

    public Paciente getPaciente() { return paciente; }

    public void setPaciente(Paciente paciente) { this.paciente = paciente; }

    public LocalDateTime getFecha() { return fecha; }

    public void setFecha(LocalDateTime fecha) { this.fecha = fecha; }

    public Boolean getLeida() { return leida; }

    public void setLeida(Boolean leida) { this.leida = leida; }

    public Boolean getEnviadaAIsla() { return enviadaAIsla; }

    public void setEnviadaAIsla(Boolean enviadaAIsla) { this.enviadaAIsla = enviadaAIsla; }

    public Boolean getEnviadaAEnfermero() { return enviadaAEnfermero; }

    public void setEnviadaAEnfermero(Boolean enviadaAEnfermero) { this.enviadaAEnfermero = enviadaAEnfermero; }

    public String getMensaje() { return mensaje; }

    public void setMensaje(String mensaje) { this.mensaje = mensaje; }
}