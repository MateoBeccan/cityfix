package com.backend.cityfix.controller;

import com.backend.cityfix.dto.ClaimDTO;
import com.backend.cityfix.dto.ClaimRequestDTO;
import com.backend.cityfix.model.Claim;
import com.backend.cityfix.model.ClaimHistory;
import com.backend.cityfix.repository.CommentRepository;
import com.backend.cityfix.repository.LikeRepository;
import com.backend.cityfix.service.ClaimService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.ZoneId;
import java.util.List;

@RestController
@RequestMapping("/api/claims")
@CrossOrigin(origins = "*")
public class ClaimController {

    private final ClaimService claimService;
    private final LikeRepository likeRepository;
    private final CommentRepository commentRepository;

    public ClaimController(
            ClaimService claimService,
            LikeRepository likeRepository,
            CommentRepository commentRepository
    ) {
        this.claimService = claimService;
        this.likeRepository = likeRepository;
        this.commentRepository = commentRepository;
    }

    // ✅ Endpoint público para obtener reclamo individual (modal)
    @GetMapping("/public/{id}")
    public ResponseEntity<ClaimDTO> getClaimPublic(@PathVariable Long id) {
        try {
            ClaimDTO dto = claimService.getClaimDtoById(id);
            return ResponseEntity.ok(dto);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    // ✅ Feed público paginado (muestra likes, comentarios y estado likedByUser)
    @GetMapping("/feed")
    public Page<ClaimDTO> getFeed(@RequestParam(defaultValue = "0") int page,
                                  @RequestParam(defaultValue = "20") int size) {
        return claimService.getFeed(page, size);
    }

    // ✅ Crear reclamo (solo usuarios con rol CIUDADANO)
    @PostMapping
    @PreAuthorize("hasRole('CIUDADANO')")
    public ResponseEntity<Claim> createClaim(@Valid @RequestBody ClaimRequestDTO dto, Authentication auth) {
        String email = auth.getName();
        System.out.println("📩 Creando reclamo para usuario: " + email);
        Claim claim = claimService.createForUser(dto, email);
        return ResponseEntity.ok(claim);
    }

    // ✅ Obtener comentarios de un reclamo
    @GetMapping("/{id}/comments")
    public ResponseEntity<List<com.backend.cityfix.dto.CommentDTO>> getComments(@PathVariable Long id) {
        return ResponseEntity.ok(claimService.getCommentsDTO(id));
    }

    // ✅ Obtener historial (solo OPERADOR o ADMIN)
    @GetMapping("/{id}/history")
    @PreAuthorize("hasAnyRole('OPERADOR','ADMIN')")
    public ResponseEntity<List<ClaimHistory>> getClaimHistory(@PathVariable Long id) {
        return ResponseEntity.ok(claimService.getClaimHistory(id));
    }

    // ✅ Alternar "me gusta" (solo CIUDADANO autenticado)
    @PostMapping("/{id}/like")
    @PreAuthorize("hasRole('CIUDADANO')")
    public ResponseEntity<ClaimDTO> toggleLike(@PathVariable Long id, Authentication authentication) {
        try {
            if (authentication == null || !authentication.isAuthenticated()) {
                System.out.println("⚠️ No autenticado al intentar dar like.");
                return ResponseEntity.status(403).build();
            }

            String email = authentication.getName();
            System.out.println("❤️ Like solicitado por: " + email);
            System.out.println("🔒 Roles: " + authentication.getAuthorities());

            ClaimDTO updatedClaim = claimService.toggleLike(id, email);
            return ResponseEntity.ok(updatedClaim);

        } catch (RuntimeException e) {
            System.err.println("❌ Error al procesar 'me gusta': " + e.getMessage());
            return ResponseEntity.status(500).build();
        }
    }

    // ✅ Reclamos del usuario autenticado (solo CIUDADANO)
    @GetMapping("/my-claims")
    @PreAuthorize("hasRole('CIUDADANO')")
    public ResponseEntity<List<ClaimDTO>> getMyClaims(Authentication auth) {
        try {
            if (auth == null || !auth.isAuthenticated()) {
                System.out.println("⚠️ No autenticado al solicitar /my-claims");
                return ResponseEntity.status(403).build();
            }

            String email = auth.getName();
            System.out.println("📋 Solicitando reclamos del usuario: " + email);

            List<Claim> claims = claimService.getByUserEmail(email);

            // Convertir a DTOs para que el frontend reciba datos coherentes
            List<ClaimDTO> dtos = claims.stream()
                    .map(c -> {
                        ClaimDTO dto = new ClaimDTO();
                        dto.setId(c.getId());
                        dto.setTitulo(c.getTitulo());
                        dto.setDescripcion(c.getDescripcion());
                        dto.setUbicacion(c.getUbicacion());
                        dto.setImagenUrl(c.getImagenUrl());
                        if (c.getEstado() != null)
                            dto.setEstado(c.getEstado().getNombre());
                        if (c.getCategoria() != null)
                            dto.setCategoria(c.getCategoria().getNombre());
                        dto.setLikesCount((int) likeRepository.countByReclamo(c));
                        dto.setComentarios(commentRepository.countByReclamo(c));
                        return dto;
                    })
                    .toList();

            return ResponseEntity.ok(dtos);

        } catch (RuntimeException e) {
            System.err.println("❌ Error al obtener mis reclamos: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }

    // ✅ Obtener todos los reclamos (solo OPERADOR o ADMIN)
    @GetMapping
    @PreAuthorize("hasAnyRole('OPERADOR', 'ADMIN')")
    public ResponseEntity<List<ClaimDTO>> getAllClaims() {
        try {
            List<Claim> claims = claimService.getAll();

            List<ClaimDTO> dtos = claims.stream()
                    .map(c -> {
                        ClaimDTO dto = new ClaimDTO();
                        dto.setId(c.getId());
                        dto.setTitulo(c.getTitulo());
                        dto.setDescripcion(c.getDescripcion());
                        dto.setUbicacion(c.getUbicacion());
                        dto.setImagenUrl(c.getImagenUrl());

                        // 🕓 Fecha de creación
                        if (c.getFechaCreacion() != null) {
                            dto.setFechaCreacion(c.getFechaCreacion()
                                    .atZone(ZoneId.systemDefault())
                                    .toInstant());
                        }

                        // 👤 Usuario
                        if (c.getUsuario() != null) {
                            dto.setUsuarioId(c.getUsuario().getId());
                            dto.setUsuarioNombre(c.getUsuario().getNombre());
                        }

                        // 📂 Categoría
                        if (c.getCategoria() != null) {
                            dto.setCategoria(c.getCategoria().getNombre());
                        } else {
                            dto.setCategoria("Sin categoría");
                        }

                        // 🏷️ Estado
                        if (c.getEstado() != null) {
                            dto.setEstado(c.getEstado().getNombre());
                        } else {
                            dto.setEstado("Sin estado");
                        }

                        // ❤️ Likes y 💬 Comentarios
                        dto.setLikesCount(claimService.countLikesByClaim(c));
                        dto.setComentarios(claimService.countCommentsByClaim(c));

                        return dto;
                    })
                    .toList();

            return ResponseEntity.ok(dtos);

        } catch (RuntimeException e) {
            System.err.println("❌ Error al obtener todos los reclamos: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }
    // ✅ Actualizar estado del reclamo (solo operador o admin)
    @PutMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('OPERADOR','ADMIN')")
    public ResponseEntity<ClaimDTO> updateStatus(
            @PathVariable Long id,
            @RequestBody com.backend.cityfix.dto.StatusUpdateRequest request,
            Authentication auth) {
        try {
            String email = auth.getName();
            ClaimDTO updated = claimService.updateClaimStatus(id, request.getEstadoNombre(), request.getDescripcion(), email);
            return ResponseEntity.ok(updated);
        } catch (RuntimeException e) {
            System.err.println("❌ Error al actualizar estado: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }




}
