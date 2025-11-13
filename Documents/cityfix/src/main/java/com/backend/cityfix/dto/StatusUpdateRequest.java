package com.backend.cityfix.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class StatusUpdateRequest {
    private String estadoNombre;
    private String descripcion;
}
