package com.nocountry.backend.dto.auth;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record RegisterRequest(

        @NotBlank(message = "El nombre es obligatorio") String name,

        @NotBlank(message = "El apellido es obligatorio") String lastname,

        @NotBlank(message = "El email es obligatorio") @Email(message = "Formato de email inválido") String email,

        @NotBlank(message = "La contraseña es obligatoria") @Size(min = 6, message = "La contraseña debe tener al menos 6 caracteres") String password,

        @NotBlank(message = "El país es obligatorio") String country

) {
}