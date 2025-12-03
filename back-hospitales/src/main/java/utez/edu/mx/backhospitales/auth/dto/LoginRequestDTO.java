package utez.edu.mx.backhospitales.auth.dto;

public class LoginRequestDTO {

    private String correo;
    private String password;

    // Constructor vacío
    public LoginRequestDTO() {
    }

    // Constructor con todos los campos
    public LoginRequestDTO(String correo, String password) {
        this.correo = correo;
        this.password = password;
    }

    // Getters y Setters

    public String getCorreo() {
        return correo;
    }

    public void setCorreo(String correo) {
        this.correo = correo;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }
}
