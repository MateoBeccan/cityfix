package com.backend.cityfix.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "comentarios")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Comment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_comentario")
    private Long id;

    @ManyToOne
    @JoinColumn(name = "id_usuario", nullable = false, referencedColumnName = "id_usuario")
    private User usuario;

    @ManyToOne
    @JoinColumn(name = "id_reclamo", nullable = false, referencedColumnName = "id_reclamo")
    private Claim reclamo;

    @Column(nullable = false, length = 500)
    private String texto;

    @Column(name = "fecha_creacion")
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
