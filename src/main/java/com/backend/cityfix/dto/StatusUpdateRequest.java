package com.backend.cityfix.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class StatusUpdateRequest {

    @NotBlank(message = "El estado no puede estar vacío")
    private String estadoNombre;

    @Size(max = 500, message = "La descripción no puede superar 500 caracteres")
    private String descripcion;
}
