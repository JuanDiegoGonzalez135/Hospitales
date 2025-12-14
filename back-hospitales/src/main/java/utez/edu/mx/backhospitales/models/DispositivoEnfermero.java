package utez.edu.mx.backhospitales.models;

import jakarta.persistence.*;

@Entity
@Table(name = "dispositivo_enfermero")
public class DispositivoEnfermero {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String token;

    @ManyToOne
    @JoinColumn(name = "enfermero_id")
    private Enfermero enfermero;

    public DispositivoEnfermero(Long id, String token, Enfermero enfermero) {
        this.id = id;
        this.token = token;
        this.enfermero = enfermero;
    }

    public DispositivoEnfermero(String token, Enfermero enfermero) {
        this.token = token;
        this.enfermero = enfermero;
    }

    public DispositivoEnfermero() {
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }

    public Enfermero getEnfermero() {
        return enfermero;
    }

    public void setEnfermero(Enfermero enfermero) {
        this.enfermero = enfermero;
    }
}

