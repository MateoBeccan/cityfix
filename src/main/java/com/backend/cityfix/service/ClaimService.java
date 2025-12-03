package com.backend.cityfix.service;

import com.backend.cityfix.dto.ClaimDTO;
import com.backend.cityfix.dto.ClaimRequestDTO;
import com.backend.cityfix.model.*;
import com.backend.cityfix.repository.*;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;

import java.time.ZoneId;
import java.util.List;
import java.util.Map;
import java.util.HashMap;
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

    // 🆕 agregamos NotificationRepository
    private final NotificationRepository notificationRepository;

    public ClaimService(
            ClaimRepository repository,
            UserRepository userRepository,
            StatusRepository statusRepository,
            ClaimHistoryRepository claimHistoryRepository,
            CommentRepository commentRepository,
            LikeRepository likeRepository,
            CategoryRepository categoryRepository,
            NotificationService notificationService,
            NotificationRepository notificationRepository   // 🆕
    ) {
        this.repository = repository;
        this.userRepository = userRepository;
        this.statusRepository = statusRepository;
        this.claimHistoryRepository = claimHistoryRepository;
        this.commentRepository = commentRepository;
        this.likeRepository = likeRepository;
        this.categoryRepository = categoryRepository;
        this.notificationService = notificationService;
        this.notificationRepository = notificationRepository; // 🆕
    }

    // ---------------------------------------------------------
    // 📌 Obtener reclamos
    // ---------------------------------------------------------
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

    // ---------------------------------------------------------
    // ✏ Crear reclamo
    // ---------------------------------------------------------
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

    // ---------------------------------------------------------
    // ✏ Editar reclamo
    // ---------------------------------------------------------
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

    // ---------------------------------------------------------
    // 🗑 Eliminar reclamo
    // ---------------------------------------------------------
    public void delete(Long id) {
        Claim claim = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Reclamo no encontrado"));

        // 🆕 BORRAR NOTIFICACIONES ANTES DEL RECLAMO (FALLA DE FK)
        notificationRepository.deleteAll(notificationRepository.findByReclamoId(id));

        likeRepository.deleteAll(likeRepository.findByReclamo(claim));
        commentRepository.deleteAll(commentRepository.findByReclamoOrderByCreatedAtDesc(claim));
        claimHistoryRepository.deleteAll(claimHistoryRepository.findByClaimIdOrderByChangedAtDesc(id));

        repository.delete(claim);
    }

    // ---------------------------------------------------------
    // 🕓 Historial
    // ---------------------------------------------------------
    public List<ClaimHistory> getClaimHistory(Long claimId) {
        return claimHistoryRepository.findByClaimIdOrderByChangedAtDesc(claimId);
    }

    // ---------------------------------------------------------
    // 📰 FEED
    // ---------------------------------------------------------
    public Page<ClaimDTO> getFeed(int page, int size) {
        return getFeed(page, size, null);
    }

    public Page<ClaimDTO> getFeed(int page, int size, String userEmail) {
        return getFeedWithFilters(page, size, null, null, "recientes", userEmail);
    }

    public Page<ClaimDTO> getFeedWithFilters(int page, int size, String estado, String categoria, String orden, String userEmail) {
        Sort sort = switch (orden) {
            case "comentados" -> Sort.by("id").descending(); // Placeholder - necesita query personalizada
            case "likes" -> Sort.by("id").descending(); // Placeholder - necesita query personalizada  
            default -> Sort.by("fechaCreacion").descending();
        };

        Pageable pageable = PageRequest.of(page, size, sort);
        Page<Claim> claimsPage;

        if ((estado != null && !estado.isEmpty()) || (categoria != null && !categoria.isEmpty())) {
            claimsPage = repository.findByEstadoAndCategoria(estado, categoria, pageable);
        } else {
            claimsPage = repository.findAll(pageable);
        }

        return new PageImpl<>(
                claimsPage.stream().map(c -> toDto(c, userEmail)).collect(Collectors.toList()),
                pageable,
                claimsPage.getTotalElements()
        );
    }

    // ---------------------------------------------------------
    // ❤️ LIKE
    // ---------------------------------------------------------
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
            
            // Notificar al dueño del reclamo
            notificationService.notifyNewLike(usuario, reclamo);
        }
    }

    // ---------------------------------------------------------
    // 🔄 Mapper a DTO
    // ---------------------------------------------------------
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

    // ---------------------------------------------------------
    // 🔎 Filtrar reclamos
    // ---------------------------------------------------------
    public List<Claim> filterClaims(String estado, String categoria, String sortBy, String order) {
        Sort sort = Sort.by(order.equalsIgnoreCase("asc") ? Sort.Direction.ASC : Sort.Direction.DESC, sortBy);
        return repository.findByEstadoAndCategoria(estado, categoria, sort);
    }

    // ---------------------------------------------------------
    // 📌 Reclamos del usuario
    // ---------------------------------------------------------
    public List<ClaimDTO> getMyClaimsDTO(String email) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        List<Claim> claims = repository.findByUsuario(user);

        return claims.stream()
                .map(c -> toDto(c, email))
                .collect(Collectors.toList());
    }

    public Claim updateStatusByName(Long id, String statusName, String description, String userEmail) {

        String normalized = statusName.trim().replaceAll("\\s+", " ");

        Claim claim = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Reclamo no encontrado"));

        Status status = statusRepository.findByNombreIgnoreCase(normalized)
                .orElseThrow(() -> new RuntimeException("Estado no encontrado: " + normalized));

        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        ClaimHistory history = ClaimHistory.builder()
                .claim(claim)
                .status(status)
                .changedBy(user)
                .description(description)
                .build();

        claimHistoryRepository.save(history);

        claim.setEstado(status);
        Claim updated = repository.save(claim);

        notificationService.notifyClaimStatusChange(updated, normalized);

        return updated;
    }
    
    // ---------------------------------------------------------
    // 📊 Estadísticas del feed
    // ---------------------------------------------------------
    public Map<String, Long> getFeedStats() {
        Map<String, Long> stats = new HashMap<>();
        
        try {
            stats.put("totalClaims", repository.count());
            stats.put("totalUsers", userRepository.count());
            stats.put("totalComments", commentRepository.count());
            stats.put("totalLikes", likeRepository.count());
        } catch (Exception e) {
            // En caso de error, devolver valores por defecto
            stats.put("totalClaims", 0L);
            stats.put("totalUsers", 0L);
            stats.put("totalComments", 0L);
            stats.put("totalLikes", 0L);
        }
        
        return stats;
    }

}
