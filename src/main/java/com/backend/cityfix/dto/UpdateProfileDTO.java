package com.backend.cityfix.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class UpdateProfileDTO {

    @NotBlank(message = "El nombre es obligatorio.")
    @Size(min = 2, max = 40, message = "El nombre debe tener entre 2 y 40 caracteres.")
    @Pattern(
            regexp = "^[A-Za-zÁÉÍÓÚáéíóúÑñ ]+$",
            message = "El nombre solo puede contener letras y espacios."
    )
    private String nombre;

    @NotBlank(message = "El email es obligatorio.")
    @Email(message = "El formato del email no es válido.")
    private String email;

    @Size(min = 6, message = "La contraseña debe tener al menos 6 caracteres.")
    @Pattern(
            regexp = "^(?=.*[A-Za-z])(?=.*\\d).*$",
            message = "La contraseña debe incluir al menos una letra y un número."
    )
    private String password; // opcional
}
