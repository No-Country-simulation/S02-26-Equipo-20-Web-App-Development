package com.nocountry.backend.dto.auth;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record AuthRequest(

        @NotBlank(message = "El email es obligatorio") @Email(message = "El formato del email no es válido") String email,

        @NotBlank(message = "La contraseña es obligatoria") String password

) {
}
