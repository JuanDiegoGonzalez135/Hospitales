package utez.edu.mx.backhospitales.models;

import jakarta.persistence.*;

@Entity
@Table(name = "dispositivos_paciente")
public class DispositivoPaciente {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    public Long id;

    @Column(name = "device_id", unique = true)
    public String deviceId; // identificador del dispositivo (ej: UUID)

    @OneToOne
    @JoinColumn(name = "paciente_id")
    public Paciente paciente;

    @OneToOne
    @JoinColumn(name = "cama_id")
    public Cama cama;

    @Column(name = "vinculado")
    public Boolean vinculado = true;

    public DispositivoPaciente() {}

    public DispositivoPaciente(Long id, String deviceId, Paciente paciente, Cama cama, Boolean vinculado) {
        this.id = id;
        this.deviceId = deviceId;
        this.paciente = paciente;
        this.cama = cama;
        this.vinculado = vinculado;
    }

    public Long getId() { return id; }

    public void setId(Long id) { this.id = id; }

    public String getDeviceId() { return deviceId; }

    public void setDeviceId(String deviceId) { this.deviceId = deviceId; }

    public Paciente getPaciente() { return paciente; }

    public void setPaciente(Paciente paciente) { this.paciente = paciente; }

    public Cama getCama() { return cama; }

    public void setCama(Cama cama) { this.cama = cama; }

    public Boolean getVinculado() { return vinculado; }

    public void setVinculado(Boolean vinculado) { this.vinculado = vinculado; }
}