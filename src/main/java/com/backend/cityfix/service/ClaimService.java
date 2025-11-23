package com.backend.cityfix.service;

import com.backend.cityfix.dto.ClaimDTO;
import com.backend.cityfix.dto.ClaimRequestDTO;
import com.backend.cityfix.model.*;
import com.backend.cityfix.repository.*;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class ClaimService {

    private final ClaimRepository repository;
    private final UserRepository userRepository;
    private final StatusRepository statusRepository;
    private final ClaimHistoryRepository claimHistoryRepository;
    private final CommentRepository commentRepository;
    private final LikeRepository likeRepository;
    private final CategoryRepository categoryRepository;
    private final NotificationService notificationService;

    public ClaimService(
            ClaimRepository repository,
            UserRepository userRepository,
            StatusRepository statusRepository,
            ClaimHistoryRepository claimHistoryRepository,
            CommentRepository commentRepository,
            LikeRepository likeRepository,
            CategoryRepository categoryRepository,
            NotificationService notificationService
    ) {
        this.repository = repository;
        this.userRepository = userRepository;
        this.statusRepository = statusRepository;
        this.claimHistoryRepository = claimHistoryRepository;
        this.commentRepository = commentRepository;
        this.likeRepository = likeRepository;
        this.categoryRepository = categoryRepository;
        this.notificationService = notificationService;
    }

    public List<Claim> getAll() {
        return repository.findAll();
    }

    public Optional<Claim> getById(Long id) {
        return repository.findById(id);
    }

    public List<Claim> getByUserEmail(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
        return repository.findByUsuario(user);
    }

    public boolean isOwner(Long claimId, String email) {
        return repository.findById(claimId)
                .map(claim -> claim.getUsuario().getEmail().equals(email))
                .orElse(false);
    }

    public Claim createForUser(ClaimRequestDTO dto, String email) {
        if (dto == null) throw new IllegalArgumentException("Datos inválidos");

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        Category category = categoryRepository.findById(dto.getCategoriaId())
                .orElseThrow(() -> new RuntimeException("Categoría no encontrada"));

        Status pendiente = statusRepository.findByNombreIgnoreCase("Pendiente")
                .orElseGet(() -> statusRepository.save(Status.builder().nombre("Pendiente").build()));

        Claim claim = Claim.builder()
                .titulo(dto.getTitulo())
                .descripcion(dto.getDescripcion())
                .ubicacion(dto.getUbicacion())
                .imagenUrl(dto.getImagenUrl())
                .categoria(category)
                .estado(pendiente)
                .usuario(user)
                .build();

        return repository.save(claim);
    }

    public Claim updateStatus(Long id, Long statusId) {
        Claim claim = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Reclamo no encontrado"));

        Status status = statusRepository.findById(statusId)
                .orElseThrow(() -> new RuntimeException("Estado no encontrado"));

        claim.setEstado(status);
        Claim updated = repository.save(claim);

        notificationService.notifyClaimStatusChange(updated, status.getNombre());

        return updated;
    }

    /**
     * 🟢 Método CORREGIDO (el que fallaba)
     */
    public Claim updateStatusByName(Long id, String statusName, String description, String userEmail) {

        // NORMALIZAR ENTRADA
        String normalized = statusName.trim().replaceAll("\\s+", " ");

        Claim claim = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Reclamo no encontrado"));

        Status status = statusRepository.findByNombreIgnoreCase(normalized)
                .orElseThrow(() -> new RuntimeException("Estado no encontrado: " + normalized));

        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        // Guardar historial
        ClaimHistory history = ClaimHistory.builder()
                .claim(claim)
                .status(status)
                .changedBy(user)
                .description(description)
                .build();

        claimHistoryRepository.save(history);

        // Actualizar reclamo
        claim.setEstado(status);
        Claim updated = repository.save(claim);

        notificationService.notifyClaimStatusChange(updated, normalized);

        return updated;
    }


    public Claim updateClaim(Long id, Claim updatedClaim, String email) {
        Claim claim = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Reclamo no encontrado"));

        if (!claim.getUsuario().getEmail().equals(email)) {
            throw new RuntimeException("No autorizado");
        }

        claim.setTitulo(updatedClaim.getTitulo());
        claim.setDescripcion(updatedClaim.getDescripcion());
        claim.setUbicacion(updatedClaim.getUbicacion());
        claim.setImagenUrl(updatedClaim.getImagenUrl());

        return repository.save(claim);
    }

    public void delete(Long id) {
        Claim claim = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Reclamo no encontrado"));

        likeRepository.deleteAll(likeRepository.findByReclamo(claim));
        commentRepository.deleteAll(commentRepository.findByReclamoOrderByCreatedAtDesc(claim));
        claimHistoryRepository.deleteAll(claimHistoryRepository.findByClaimIdOrderByChangedAtDesc(id));

        repository.delete(claim);
    }

    public List<ClaimHistory> getClaimHistory(Long claimId) {
        return claimHistoryRepository.findByClaimIdOrderByChangedAtDesc(claimId);
    }

    public Page<ClaimDTO> getFeed(int page, int size) {
        Pageable pageable =
                PageRequest.of(page, size, Sort.by("fechaCreacion").descending());

        Page<Claim> claimsPage = repository.findAll(pageable);

        return new PageImpl<>(
                claimsPage.stream().map(this::toDto).collect(Collectors.toList()),
                pageable,
                claimsPage.getTotalElements()
        );
    }

    public Page<ClaimDTO> getFeed(int page, int size, String userEmail) {
        Pageable pageable =
                PageRequest.of(page, size, Sort.by("fechaCreacion").descending());

        Page<Claim> claimsPage = repository.findAll(pageable);

        return new PageImpl<>(
                claimsPage.stream().map(c -> toDto(c, userEmail)).collect(Collectors.toList()),
                pageable,
                claimsPage.getTotalElements()
        );
    }

    private ClaimDTO toDto(Claim c) {
        return toDto(c, null);
    }

    private ClaimDTO toDto(Claim c, String userEmail) {
        ClaimDTO dto = new ClaimDTO();

        dto.setId(c.getId());
        dto.setTitulo(c.getTitulo());
        dto.setDescripcion(c.getDescripcion());
        dto.setUbicacion(c.getUbicacion());
        dto.setImagenUrl(c.getImagenUrl());

        if (c.getFechaCreacion() != null) {
            dto.setFechaCreacion(c.getFechaCreacion().atZone(ZoneId.systemDefault()).toInstant());
        }

        if (c.getUsuario() != null) {
            dto.setUsuarioId(c.getUsuario().getId());
            dto.setUsuarioNombre(c.getUsuario().getNombre());
        }

        if (c.getCategoria() != null) dto.setCategoria(c.getCategoria().getNombre());
        if (c.getEstado() != null) dto.setEstado(c.getEstado().getNombre());

        dto.setLikes(likeRepository.countByReclamo(c));
        dto.setComentarios(commentRepository.countByReclamo(c));

        boolean liked = false;
        if (userEmail != null) {
            var user = userRepository.findByEmail(userEmail);
            if (user.isPresent()) {
                liked = likeRepository.existsByUsuarioAndReclamo(user.get(), c);
            }
        }
        dto.setLikedByUser(liked);

        return dto;
    }

    public void toggleLike(Long claimId, String email) {
        User usuario = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        Claim reclamo = repository.findById(claimId)
                .orElseThrow(() -> new RuntimeException("Reclamo no encontrado"));

        Optional<Like> existing = likeRepository.findByUsuarioAndReclamo(usuario, reclamo);

        if (existing.isPresent()) {
            likeRepository.delete(existing.get());
        } else {
            Like like = new Like();
            like.setUsuario(usuario);
            like.setReclamo(reclamo);
            likeRepository.save(like);
        }
    }

    public Comment addComment(Long claimId, String text, String email) {
        if (text == null || text.trim().isEmpty())
            throw new IllegalArgumentException("Comentario vacío");

        User usuario = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        Claim reclamo = repository.findById(claimId)
                .orElseThrow(() -> new RuntimeException("Reclamo no encontrado"));

        Comment comment = new Comment();
        comment.setUsuario(usuario);
        comment.setReclamo(reclamo);
        comment.setTexto(text.trim());
        comment.setCreatedAt(LocalDateTime.now());

        return commentRepository.save(comment);
    }

    public List<com.backend.cityfix.dto.CommentDTO> getCommentsDTO(Long claimId) {
        Claim reclamo = repository.findById(claimId)
                .orElseThrow(() -> new RuntimeException("Reclamo no encontrado"));

        return commentRepository
                .findByReclamoOrderByCreatedAtDesc(reclamo)
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

    public List<Claim> filterClaims(String estado, String categoria, String sortBy, String order) {
        Sort sort = Sort.by(order.equalsIgnoreCase("asc") ? Sort.Direction.ASC : Sort.Direction.DESC, sortBy);
        return repository.findByEstadoAndCategoria(estado, categoria, sort);
    }

    public List<ClaimDTO> getMyClaimsDTO(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        List<Claim> claims = repository.findByUsuario(user);

        return claims.stream()
                .map(c -> toDto(c, email))
                .collect(Collectors.toList());
    }
}
