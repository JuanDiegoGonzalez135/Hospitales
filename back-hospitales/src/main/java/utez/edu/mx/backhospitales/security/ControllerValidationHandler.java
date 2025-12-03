package utez.edu.mx.backhospitales.security;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import utez.edu.mx.backhospitales.Utils.APIResponse;

import java.util.HashMap;
import java.util.Map;

@ControllerAdvice
public class ControllerValidationHandler {
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<APIResponse> handleException(MethodArgumentNotValidException ex) {
        Map<String, String> errors = new HashMap<>();
        ex.getBindingResult().getFieldErrors().forEach(e ->
                errors.put(e.getField(), e.getDefaultMessage())
        );
        APIResponse response = new APIResponse(
                errors,
                true,
                "Favor de revisar la información",
                HttpStatus.BAD_REQUEST
        );
        return new ResponseEntity<>(response, response.getStatus());
    }
}
