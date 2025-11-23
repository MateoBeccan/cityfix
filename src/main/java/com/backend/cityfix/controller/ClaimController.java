package com.backend.cityfix.controller;

import com.backend.cityfix.dto.ClaimDTO;
import com.backend.cityfix.dto.ClaimRequestDTO;
import com.backend.cityfix.dto.StatusUpdateRequest;
import com.backend.cityfix.model.Claim;
import com.backend.cityfix.model.ClaimHistory;
import com.backend.cityfix.service.ClaimService;
import jakarta.validation.Valid;
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

    @PostMapping
    @PreAuthorize("hasRole('CIUDADANO')")
    public ResponseEntity<Claim> createClaim(
            @Valid @RequestBody ClaimRequestDTO dto,
            Authentication auth) {

        return ResponseEntity.ok(claimService.createForUser(dto, auth.getName()));
    }

    @GetMapping("/my-claims")
    @PreAuthorize("hasRole('CIUDADANO')")
    public ResponseEntity<List<ClaimDTO>> getMyClaims(Authentication auth) {
        return ResponseEntity.ok(claimService.getMyClaimsDTO(auth.getName()));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('CIUDADANO') and @claimService.isOwner(#id, authentication.name)")
    public ResponseEntity<Void> deleteClaim(@PathVariable Long id) {
        claimService.delete(id);
        return ResponseEntity.ok().build();
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('OPERADOR','ADMIN')")
    public ResponseEntity<List<Claim>> getAllClaims() {
        return ResponseEntity.ok(claimService.getAll());
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('OPERADOR','ADMIN') or (hasRole('CIUDADANO') and @claimService.isOwner(#id, authentication.name))")
    public ResponseEntity<Claim> getClaimById(@PathVariable Long id) {
        return claimService.getById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('OPERADOR','ADMIN')")
    public ResponseEntity<Claim> updateClaimStatus(
            @PathVariable Long id,
            @Valid @RequestBody StatusUpdateRequest request,
            Authentication auth) {

        return ResponseEntity.ok(
                claimService.updateStatusByName(
                        id,
                        request.getEstadoNombre(),
                        request.getDescripcion(),
                        auth.getName()
                )
        );
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or (hasRole('CIUDADANO') and @claimService.isOwner(#id, authentication.name))")
    public ResponseEntity<Claim> updateClaim(
            @PathVariable Long id,
            @Valid @RequestBody Claim claim,
            Authentication auth) {

        return ResponseEntity.ok(claimService.updateClaim(id, claim, auth.getName()));
    }

    @GetMapping("/{id}/history")
    @PreAuthorize("hasAnyRole('OPERADOR','ADMIN') or (hasRole('CIUDADANO') and @claimService.isOwner(#id, authentication.name))")
    public ResponseEntity<List<ClaimHistory>> getClaimHistory(@PathVariable Long id) {
        return ResponseEntity.ok(claimService.getClaimHistory(id));
    }

    @GetMapping("/feed")
    public Page<ClaimDTO> feed(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            Authentication auth) {

        String email = (auth != null) ? auth.getName() : null;
        return claimService.getFeed(page, size, email);
    }

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

        var comment = claimService.addComment(id, body.get("text"), auth.getName());
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

    @GetMapping("/filter")
    @PreAuthorize("hasRole('OPERADOR')")
    public ResponseEntity<List<Claim>> filterClaims(
            @RequestParam(required = false) String estado,
            @RequestParam(required = false) String categoria,
            @RequestParam(defaultValue = "fechaCreacion") String sortBy,
            @RequestParam(defaultValue = "desc") String order) {

        return ResponseEntity.ok(claimService.filterClaims(estado, categoria, sortBy, order));
    }
}
