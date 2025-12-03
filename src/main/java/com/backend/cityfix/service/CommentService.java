package com.backend.cityfix.service;

import com.backend.cityfix.model.*;
import com.backend.cityfix.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

@Service
@RequiredArgsConstructor
public class CommentService {

    private final CommentRepository commentRepository;
    private final UserRepository userRepository;
    private final ClaimRepository claimRepository;
    private final NotificationService notificationService;

    // 🚫 Palabras prohibidas
    private static final List<String> PALABRAS_PROHIBIDAS = List.of(
            "puta", "mierda", "boludo", "imbecil",
            "www.", "http", "https", "sex", "porno"
    );

    // ---------------------------------------------------------
    // 🛡 Validación anti-spam
    // ---------------------------------------------------------
    private void validarComentarioSeguro(String texto) {

        if (texto == null || texto.trim().isEmpty())
            throw new RuntimeException("El comentario no puede estar vacío.");

        texto = texto.trim();

        if (texto.length() < 3)
            throw new RuntimeException("El comentario es demasiado corto.");

        if (texto.length() > 500)
            throw new RuntimeException("El comentario supera el máximo permitido (500 caracteres).");

        String lower = texto.toLowerCase();

        for (String p : PALABRAS_PROHIBIDAS) {
            if (lower.contains(p))
                throw new RuntimeException("El comentario contiene lenguaje inapropiado.");
        }

        // Evitar repeticiones "holaaaaaa"
        if (texto.matches(".*(.)\\1{4,}.*"))
            throw new RuntimeException("El comentario contiene caracteres repetidos en exceso.");

        // Evitar texto sin letras
        if (texto.matches("^[^a-zA-Z0-9áéíóúÁÉÍÓÚ]+$"))
            throw new RuntimeException("El comentario debe contener palabras reales.");
    }

    // ---------------------------------------------------------
    // ✏ Crear comentario
    // ---------------------------------------------------------
    @Transactional
    public Comment addComment(Long claimId, String userEmail, String texto) {

        validarComentarioSeguro(texto);

        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        Claim claim = claimRepository.findById(claimId)
                .orElseThrow(() -> new RuntimeException("Reclamo no encontrado"));

        Comment comment = Comment.builder()
                .usuario(user)
                .reclamo(claim)
                .texto(texto.trim())
                .build();

        Comment saved = commentRepository.save(comment);
        
        // Notificar al dueño del reclamo (si no es el mismo usuario)
        if (!claim.getUsuario().getId().equals(user.getId())) {
            notificationService.notifyNewComment(user, claim, texto.trim());
        }
        
        return saved;
    }

    // ---------------------------------------------------------
    // ✏ Editar comentario
    // ---------------------------------------------------------
    @Transactional
    public Comment updateComment(Long commentId, String userEmail, String nuevoTexto) {

        validarComentarioSeguro(nuevoTexto);

        Comment c = commentRepository.findById(commentId)
                .orElseThrow(() -> new RuntimeException("Comentario no encontrado"));

        User editor = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        boolean esAutor = c.getUsuario().getEmail().equals(userEmail);
        boolean esAdmin = editor.getRole().getNombre().equalsIgnoreCase("ADMIN");

        if (!esAutor && !esAdmin)
            throw new RuntimeException("No tienes permiso para editar este comentario.");

        c.setTexto(nuevoTexto.trim());
        c.setUpdatedAt();

        return commentRepository.save(c);
    }

    // ---------------------------------------------------------
    // 🗑 Eliminar comentario
    // ---------------------------------------------------------
    @Transactional
    public void deleteComment(Long commentId, String userEmail) {

        Comment c = commentRepository.findById(commentId)
                .orElseThrow(() -> new RuntimeException("Comentario no encontrado"));

        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        boolean esAutor = c.getUsuario().getEmail().equals(userEmail);
        boolean esAdmin = user.getRole().getNombre().equalsIgnoreCase("ADMIN");

        if (!esAutor && !esAdmin)
            throw new RuntimeException("No tienes permiso para borrar este comentario.");

        commentRepository.delete(c);
    }

    // ---------------------------------------------------------
    // 📌 Obtener comentarios
    // ---------------------------------------------------------
    public List<Comment> getComments(Long claimId) {
        Claim claim = claimRepository.findById(claimId)
                .orElseThrow(() -> new RuntimeException("Reclamo no encontrado"));

        return commentRepository.findByReclamoOrderByCreatedAtDesc(claim);
    }
    // ---------------------------------------------------------
// 📌 Obtener comentarios como DTO
// ---------------------------------------------------------
    public List<com.backend.cityfix.dto.CommentDTO> getCommentsDTO(Long claimId) {

        Claim claim = claimRepository.findById(claimId)
                .orElseThrow(() -> new RuntimeException("Reclamo no encontrado"));

        return commentRepository.findByReclamoOrderByCreatedAtDesc(claim)
                .stream()
                .map(c -> {
                    com.backend.cityfix.dto.CommentDTO dto = new com.backend.cityfix.dto.CommentDTO();
                    dto.setId(c.getId());
                    dto.setTexto(c.getTexto());
                    dto.setFechaCreacion(c.getCreatedAt());
                    dto.setUsuarioId(c.getUsuario().getId());
                    dto.setUsuarioNombre(c.getUsuario().getNombre());
                    return dto;
                })
                .toList();
    }

}
