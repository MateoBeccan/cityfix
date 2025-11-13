package com.backend.cityfix.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "reclamos")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Claim {

    @Id
    @Column(name = "id_reclamo")
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 150)
    @NotBlank(message = "El título es obligatorio")
    @Size(min = 5, max = 150, message = "El título debe tener entre 5 y 150 caracteres")
    private String titulo;

    @Column(nullable = false, columnDefinition = "TEXT")
    @NotBlank(message = "La descripción es obligatoria")
    @Size(min = 10, max = 2000, message = "La descripción debe tener entre 10 y 2000 caracteres")
    private String descripcion;

    @Column(length = 255)
    @Size(max = 255, message = "La ubicación no puede exceder 255 caracteres")
    private String ubicacion;

    @Column(length = 255)
    @Size(max = 255, message = "La URL de imagen no puede exceder 255 caracteres")
    @Pattern(regexp = "^(https?://.+\\.(jpg|jpeg|png|gif|webp))?$", message = "La URL debe ser válida y apuntar a una imagen")
    private String imagenUrl;

    @Column(name = "fecha_creacion", updatable = false)
    private LocalDateTime fechaCreacion;
    
    @PrePersist
    protected void onCreate() {
        fechaCreacion = LocalDateTime.now();
    }

    @ManyToOne
    @JoinColumn(name = "id_usuario", nullable = false, referencedColumnName = "id_usuario")
    private User usuario;

    @ManyToOne
    @JoinColumn(name = "id_categoria", nullable = false, referencedColumnName = "id_categoria")
    @NotNull(message = "La categoría es obligatoria")
    private Category categoria;

    @ManyToOne
    @JoinColumn(name = "id_estado", nullable = false, referencedColumnName = "id_estado")
    private Status estado;
}