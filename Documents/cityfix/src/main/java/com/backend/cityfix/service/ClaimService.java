package com.backend.cityfix.service;

import com.backend.cityfix.dto.ClaimDTO;
import com.backend.cityfix.dto.ClaimRequestDTO;
import com.backend.cityfix.model.*;
import com.backend.cityfix.repository.*;
import org.springframework.data.domain.*;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

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

    public ClaimService(ClaimRepository repository,
                        UserRepository userRepository,
                        StatusRepository statusRepository,
                        ClaimHistoryRepository claimHistoryRepository,
                        CommentRepository commentRepository,
                        LikeRepository likeRepository,
                        CategoryRepository categoryRepository) {
        this.repository = repository;
        this.userRepository = userRepository;
        this.statusRepository = statusRepository;
        this.claimHistoryRepository = claimHistoryRepository;
        this.commentRepository = commentRepository;
        this.likeRepository = likeRepository;
        this.categoryRepository = categoryRepository;
    }

    // 🔹 Obtener todos los reclamos (ADMIN/OPERADOR)
    // 🔹 Obtener todos los reclamos (ADMIN/OPERADOR), ordenados por fecha descendente
    public List<Claim> getAll() {
        return repository.findAll(Sort.by(Sort.Direction.DESC, "fechaCreacion"));
    }


    // 🔹 Obtener reclamo por ID
    public Optional<Claim> getById(Long id) {
        return repository.findById(id);
    }

    // 🔹 Obtener reclamos del usuario autenticado
    public List<Claim> getByUserEmail(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
        return repository.findByUsuario(user);
    }

    // 🔹 Verificar propietario
    public boolean isOwner(Long claimId, String email) {
        return repository.findById(claimId)
                .map(c -> c.getUsuario().getEmail().equals(email))
                .orElse(false);
    }

    // 🔹 Crear reclamo (Ciudadano)
    public Claim createForUser(ClaimRequestDTO dto, String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        Category category = categoryRepository.findById(dto.getCategoriaId())
                .orElseThrow(() -> new RuntimeException("Categoría no encontrada"));

        Status pendiente = statusRepository.findByNombre("Pendiente")
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

    // 🔹 Actualizar reclamo (solo dueño o admin)
    public Claim updateClaim(Long id, Claim updatedClaim, String email) {
        Claim claim = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Reclamo no encontrado"));

        if (!claim.getUsuario().getEmail().equals(email))
            throw new RuntimeException("No autorizado para modificar este reclamo");

        claim.setTitulo(updatedClaim.getTitulo());
        claim.setDescripcion(updatedClaim.getDescripcion());
        claim.setUbicacion(updatedClaim.getUbicacion());
        claim.setImagenUrl(updatedClaim.getImagenUrl());
        return repository.save(claim);
    }

    // 🔹 Eliminar reclamo
    public void delete(Long id) {
        repository.deleteById(id);
    }

    // 🔹 Obtener historial
    public List<ClaimHistory> getClaimHistory(Long claimId) {
        return claimHistoryRepository.findByClaimIdOrderByChangedAtDesc(claimId);
    }

    // 🔹 Obtener feed público con likes personalizados por usuario
    public Page<ClaimDTO> getFeed(int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("fechaCreacion").descending());
        Page<Claim> claimsPage = repository.findAll(pageable);

        // Obtener usuario autenticado (si existe)
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        User userCtx = null;
        if (auth != null && auth.isAuthenticated() && !"anonymousUser".equals(auth.getName())) {
            userCtx = userRepository.findByEmail(auth.getName()).orElse(null);
        }

        // Mapear cada reclamo al DTO con el contexto del usuario (final)
        final User currentUser = userCtx;

        List<ClaimDTO> dtos = claimsPage.stream()
                .map(c -> toDtoWithUser(c, currentUser))
                .collect(Collectors.toList());

        return new PageImpl<>(dtos, pageable, claimsPage.getTotalElements());
    }

    // 🔹 Versión extendida de toDto() con conocimiento del usuario actual
    private ClaimDTO toDtoWithUser(Claim c, User currentUser) {
        ClaimDTO dto = new ClaimDTO();
        dto.setId(c.getId());
        dto.setTitulo(c.getTitulo());
        dto.setDescripcion(c.getDescripcion());
        dto.setUbicacion(c.getUbicacion());
        dto.setImagenUrl(c.getImagenUrl());

        if (c.getFechaCreacion() != null)
            dto.setFechaCreacion(c.getFechaCreacion().atZone(ZoneId.systemDefault()).toInstant());

        if (c.getUsuario() != null) {
            dto.setUsuarioId(c.getUsuario().getId());
            dto.setUsuarioNombre(c.getUsuario().getNombre());
        }

        if (c.getCategoria() != null)
            dto.setCategoria(c.getCategoria().getNombre());

        if (c.getEstado() != null)
            dto.setEstado(c.getEstado().getNombre());

        // ✅ Contadores
        dto.setLikesCount((int) likeRepository.countByReclamo(c));
        dto.setComentarios(commentRepository.countByReclamo(c));

        // ✅ likedByUser según usuario autenticado
        if (currentUser != null) {
            dto.setLikedByUser(likeRepository.existsByUsuarioAndReclamo(currentUser, c));
        } else {
            dto.setLikedByUser(false);
        }

        return dto;
    }

    // 🔹 Obtener reclamo público (para modal)
    public ClaimDTO getClaimDtoById(Long id) {
        Claim claim = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Reclamo no encontrado"));

        // Incluir usuario autenticado para likedByUser
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        User currentUser = null;
        if (auth != null && auth.isAuthenticated() && !"anonymousUser".equals(auth.getName())) {
            currentUser = userRepository.findByEmail(auth.getName()).orElse(null);
        }

        return toDtoWithUser(claim, currentUser);
    }

    // 🔹 Alternar like y devolver DTO actualizado
    public ClaimDTO toggleLike(Long claimId, String email) {
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

        return toDtoWithUser(reclamo, usuario);
    }

    // 🔹 Obtener comentarios DTO
    public List<com.backend.cityfix.dto.CommentDTO> getCommentsDTO(Long claimId) {
        Claim reclamo = repository.findById(claimId)
                .orElseThrow(() -> new RuntimeException("Reclamo no encontrado"));

        return commentRepository.findByReclamoOrderByCreatedAtDesc(reclamo).stream()
                .map(c -> {
                    com.backend.cityfix.dto.CommentDTO dto = new com.backend.cityfix.dto.CommentDTO();
                    dto.setId(c.getId());
                    dto.setTexto(c.getTexto());
                    dto.setFechaCreacion(c.getCreatedAt());
                    dto.setUsuarioId(c.getUsuario().getId());
                    dto.setUsuarioNombre(c.getUsuario().getNombre());
                    return dto;
                })
                .collect(Collectors.toList());
    }
    public int countLikesByClaim(Claim c) {
        return Math.toIntExact(likeRepository.countByReclamo(c));
    }

    public int countCommentsByClaim(Claim c) {
        return Math.toIntExact(commentRepository.countByReclamo(c));
    }
    // ✅ Actualizar el estado del reclamo y registrar en el historial
    // ✅ Actualizar estado del reclamo y registrar historial con relaciones reales
    public ClaimDTO updateClaimStatus(Long claimId, String nuevoEstado, String descripcion, String emailOperador) {
        // Buscar el reclamo
        Claim claim = repository.findById(claimId)
                .orElseThrow(() -> new RuntimeException("Reclamo no encontrado"));

        // Guardar el estado anterior (solo para logging)
        String estadoAnterior = claim.getEstado() != null ? claim.getEstado().getNombre() : "Sin estado";

        // Buscar o crear el nuevo estado
        Status estado = statusRepository.findByNombre(nuevoEstado)
                .orElseGet(() -> statusRepository.save(Status.builder().nombre(nuevoEstado).build()));

        // Buscar el usuario operador que realiza el cambio
        User operador = userRepository.findByEmail(emailOperador)
                .orElseThrow(() -> new RuntimeException("Operador no encontrado"));

        // Actualizar el reclamo
        claim.setEstado(estado);
        repository.save(claim);

        // Crear y guardar el historial con relaciones reales
        ClaimHistory history = new ClaimHistory();
        history.setClaim(claim);
        history.setStatus(estado);
        history.setChangedBy(operador);
        history.setDescription(
                descripcion != null && !descripcion.isEmpty()
                        ? descripcion
                        : "Cambio de estado de " + estadoAnterior + " a " + nuevoEstado
        );
        claimHistoryRepository.save(history);

        // Retornar DTO actualizado
        return toDtoWithUser(claim, operador);
    }



}
