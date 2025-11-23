package com.backend.cityfix.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "notification")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Título resumido (ej: "Estado actualizado", "Nuevo comentario")
    @Column(nullable = false)
    private String titulo;

    // Mensaje detallado
    @Column(nullable = false)
    private String mensaje;

    // Tipo: estado, comentario, sistema
    @Column(nullable = false)
    private String tipo;

    @ManyToOne
    @JoinColumn(name = "usuario_id", nullable = false)
    private User usuario;

    @ManyToOne
    @JoinColumn(name = "reclamo_id", nullable = true)
    private Claim reclamo;

    @Column(nullable = false)
    private boolean leido = false;

    @Column(nullable = false)
    private LocalDateTime fecha = LocalDateTime.now();
}
