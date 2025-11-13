package com.backend.cityfix.controller;

import com.backend.cityfix.dto.ClaimDTO;
import com.backend.cityfix.dto.ClaimRequestDTO;
import com.backend.cityfix.model.Claim;
import com.backend.cityfix.model.ClaimHistory;
import com.backend.cityfix.model.Comment;
import com.backend.cityfix.service.ClaimService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/claims")
@CrossOrigin(origins = "*")
public class ClaimController {

    private final ClaimService claimService;

    public ClaimController(ClaimService claimService) {
        this.claimService = claimService;
    }

    // CIUDADANO: Crear reclamo
    @PostMapping
    @PreAuthorize("hasRole('CIUDADANO')")
    public ResponseEntity<Claim> createClaim(@Valid @RequestBody ClaimRequestDTO dto, Authentication authentication) {
        return ResponseEntity.ok(claimService.createForUser(dto, authentication.getName()));
    }

    // CIUDADANO: Ver mis reclamos
    @GetMapping("/my-claims")
    @PreAuthorize("hasRole('CIUDADANO')")
    public ResponseEntity<List<Claim>> getMyClaims(Authentication authentication) {
        return ResponseEntity.ok(claimService.getByUserEmail(authentication.getName()));
    }

    // CIUDADANO: Eliminar mi reclamo
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('CIUDADANO') and @claimService.isOwner(#id, authentication.name)")
    public ResponseEntity<Void> deleteClaim(@PathVariable Long id) {
        claimService.delete(id);
        return ResponseEntity.ok().build();
    }

    // OPERADOR y ADMIN: Ver todos los reclamos
    @GetMapping
    @PreAuthorize("hasAnyRole('OPERADOR', 'ADMIN')")
    public ResponseEntity<List<Claim>> getAllClaims() {
        return ResponseEntity.ok(claimService.getAll());
    }

    // OPERADOR y ADMIN: Ver reclamo específico, CIUDADANO: solo sus reclamos
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('OPERADOR', 'ADMIN') or (hasRole('CIUDADANO') and @claimService.isOwner(#id, authentication.name))")
    public ResponseEntity<Claim> getClaimById(@PathVariable Long id) {
        return claimService.getById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // OPERADOR y ADMIN: Cambiar estado de reclamo
    @PutMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('OPERADOR', 'ADMIN')")
    public ResponseEntity<Claim> updateClaimStatus(@PathVariable Long id, @Valid @RequestBody StatusUpdateRequest request, Authentication authentication) {
        return ResponseEntity.ok(claimService.updateStatusByName(id, request.getEstadoNombre(), request.getDescripcion(), authentication.getName()));
    }

    public static class StatusUpdateRequest {
        @NotBlank(message = "El nombre del estado es obligatorio")
        private String estadoNombre;

        @Size(max = 500, message = "La descripción no puede exceder 500 caracteres")
        private String descripcion;

        public String getEstadoNombre() {
            return estadoNombre;
        }

        public void setEstadoNombre(String estadoNombre) {
            this.estadoNombre = estadoNombre;
        }

        public String getDescripcion() {
            return descripcion;
        }

        public void setDescripcion(String descripcion) {
            this.descripcion = descripcion;
        }
    }

    @DeleteMapping("/admin/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> adminDeleteClaim(@PathVariable Long id) {
        claimService.delete(id);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or (hasRole('CIUDADANO') and @claimService.isOwner(#id, authentication.name))")
    public ResponseEntity<Claim> updateClaim(@PathVariable Long id, @Valid @RequestBody Claim claim, Authentication authentication) {
        return ResponseEntity.ok(claimService.updateClaim(id, claim, authentication.getName()));
    }

    @GetMapping("/{id}/history")
    @PreAuthorize("hasAnyRole('OPERADOR', 'ADMIN') or (hasRole('CIUDADANO') and @claimService.isOwner(#id, authentication.name))")
    public ResponseEntity<List<ClaimHistory>> getClaimHistory(@PathVariable Long id) {
        return ResponseEntity.ok(claimService.getClaimHistory(id));
    }

    @GetMapping("/feed")
    public Page<ClaimDTO> feed(@RequestParam(defaultValue = "0") int page,
                               @RequestParam(defaultValue = "20") int size) {
        return claimService.getFeed(page, size);
    }

    // --- Likes y Comentarios --- //
    @PostMapping("/{id}/like")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Void> toggleLike(@PathVariable Long id, Authentication auth) {
        claimService.toggleLike(id, auth.getName());
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{id}/comments")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<com.backend.cityfix.dto.CommentDTO> addComment(
            @PathVariable Long id,
            @RequestBody Map<String, String> body,
            Authentication auth) {

        String text = body.get("text");
        //  Convertimos el Comment a CommentDTO para devolver usuarioNombre
        var comment = claimService.addComment(id, text, auth.getName());
        var dto = new com.backend.cityfix.dto.CommentDTO();
        dto.setId(comment.getId());
        dto.setTexto(comment.getTexto());
        dto.setFechaCreacion(comment.getCreatedAt());
        dto.setUsuarioId(comment.getUsuario().getId());
        dto.setUsuarioNombre(comment.getUsuario().getNombre());
        return ResponseEntity.ok(dto);
    }

    @GetMapping("/{id}/comments")
    public ResponseEntity<List<com.backend.cityfix.dto.CommentDTO>> getComments(@PathVariable Long id) {
        return ResponseEntity.ok(claimService.getCommentsDTO(id));
    }
    // OPERADOR: Filtrar reclamos por estado y/o categoría
    @GetMapping("/filter")
    @PreAuthorize("hasRole('OPERADOR')")
    public ResponseEntity<List<Claim>> filterClaims(
            @RequestParam(required = false) String estado,
            @RequestParam(required = false) String categoria,
            @RequestParam(required = false, defaultValue = "fechaCreacion") String sortBy,
            @RequestParam(required = false, defaultValue = "desc") String order
    ) {
        return ResponseEntity.ok(claimService.filterClaims(estado, categoria, sortBy, order));
    }





}
