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

    // Constructor completo con CategoryRepository incluido
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

    //  Obtener todos los reclamos (para ADMIN y OPERADOR)
    public List<Claim> getAll() {
        return repository.findAll();
    }

    //  Obtener reclamo por ID
    public Optional<Claim> getById(Long id) {
        return repository.findById(id);
    }

    //  Obtener reclamos de un usuario por su email
    public List<Claim> getByUserEmail(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
        return repository.findByUsuario(user);
    }

    //  Verificar si el reclamo pertenece al usuario autenticado
    public boolean isOwner(Long claimId, String email) {
        return repository.findById(claimId)
                .map(claim -> claim.getUsuario().getEmail().equals(email))
                .orElse(false);
    }

    //  Crear reclamo desde DTO (CIUDADANO)
    public Claim createForUser(ClaimRequestDTO dto, String email) {
        if (dto == null) throw new IllegalArgumentException("Los datos del reclamo no pueden ser nulos");
        if (email == null || email.trim().isEmpty()) throw new IllegalArgumentException("El email no puede estar vacío");

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

    //  Actualizar estado por ID
    public Claim updateStatus(Long id, Long statusId) {
        Claim claim = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Reclamo no encontrado"));
        Status status = statusRepository.findById(statusId)
                .orElseThrow(() -> new RuntimeException("Estado no encontrado"));

        claim.setEstado(status);
        return repository.save(claim);
    }

    //  Actualizar estado por nombre (OPERADOR / ADMIN)
    public Claim updateStatusByName(Long id, String statusName, String description, String userEmail) {
        if (id == null || id <= 0) throw new IllegalArgumentException("ID de reclamo inválido");
        if (statusName == null || statusName.trim().isEmpty()) throw new IllegalArgumentException("El nombre del estado no puede estar vacío");
        if (userEmail == null || userEmail.trim().isEmpty()) throw new IllegalArgumentException("El email del usuario no puede estar vacío");

        Claim claim = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Reclamo no encontrado"));
        Status status = statusRepository.findByNombre(statusName)
                .orElseThrow(() -> new RuntimeException("Estado no encontrado: " + statusName));
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        if (claim.getEstado() != null && claim.getEstado().getNombre().equals(statusName)) {
            throw new IllegalArgumentException("El reclamo ya tiene el estado: " + statusName);
        }

        ClaimHistory history = ClaimHistory.builder()
                .claim(claim)
                .status(status)
                .changedBy(user)
                .description(description)
                .build();
        claimHistoryRepository.save(history);

        claim.setEstado(status);
        return repository.save(claim);
    }

    //  Actualizar reclamo (solo dueño o admin)
    public Claim updateClaim(Long id, Claim updatedClaim, String email) {
        Claim claim = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Reclamo no encontrado"));

        if (!claim.getUsuario().getEmail().equals(email)) {
            throw new RuntimeException("No autorizado para modificar este reclamo");
        }

        claim.setTitulo(updatedClaim.getTitulo());
        claim.setDescripcion(updatedClaim.getDescripcion());
        claim.setUbicacion(updatedClaim.getUbicacion());
        claim.setImagenUrl(updatedClaim.getImagenUrl());

        return repository.save(claim);
    }

    //  Guardar reclamo directamente
    public Claim save(Claim claim) {
        return repository.save(claim);
    }

    //  Eliminar reclamo por ID
    public void delete(Long id) {
        if (id == null || id <= 0)
            throw new IllegalArgumentException("ID de reclamo inválido");

        Claim claim = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Reclamo no encontrado"));

        //  Borrar likes
        likeRepository.deleteAll(likeRepository.findByReclamo(claim));

        //  Borrar comentarios
        commentRepository.deleteAll(commentRepository.findByReclamoOrderByCreatedAtDesc(claim));

        //  Borrar historial
        claimHistoryRepository.deleteAll(claimHistoryRepository.findByClaimIdOrderByChangedAtDesc(id));

        //  Finalmente borrar reclamo
        repository.delete(claim);
    }


    //  Obtener historial de cambios del reclamo
    public List<ClaimHistory> getClaimHistory(Long claimId) {
        return claimHistoryRepository.findByClaimIdOrderByChangedAtDesc(claimId);
    }

    //  Obtener feed público (con DTO)
    public Page<ClaimDTO> getFeed(int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("fechaCreacion").descending());
        Page<Claim> claimsPage = repository.findAll(pageable);

        return new PageImpl<>(
                claimsPage.stream().map(this::toDto).collect(Collectors.toList()),
                pageable,
                claimsPage.getTotalElements()
        );
    }

    //  Convertir Claim → ClaimDTO
    private ClaimDTO toDto(Claim c) {
        ClaimDTO dto = new ClaimDTO();
        dto.setId(c.getId());
        dto.setTitulo(c.getTitulo());
        dto.setDescripcion(c.getDescripcion());
        dto.setUbicacion(c.getUbicacion());
        dto.setImagenUrl(c.getImagenUrl());

        if (c.getFechaCreacion() != null) {
            dto.setFechaCreacion(c.getFechaCreacion().atZone(ZoneId.systemDefault()).toInstant());
        } else {
            dto.setFechaCreacion(java.time.Instant.now());
        }

        if (c.getUsuario() != null) {
            dto.setUsuarioId(c.getUsuario().getId());
            dto.setUsuarioNombre(c.getUsuario().getNombre());
        } else {
            dto.setUsuarioNombre("Usuario desconocido");
        }

        if (c.getCategoria() != null)
            dto.setCategoria(c.getCategoria().getNombre());

        if (c.getEstado() != null)
            dto.setEstado(c.getEstado().getNombre());

        // 🔥 Feed social: contadores reales desde DB
        dto.setLikes(likeRepository.countByReclamo(c));
        dto.setComentarios(commentRepository.countByReclamo(c));

        return dto;
    }


    //  Alternar like
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

    //  Agregar comentario
    public Comment addComment(Long claimId, String text, String email) {
        if (text == null || text.trim().isEmpty()) {
            throw new IllegalArgumentException("El comentario no puede estar vacío");
        }

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

    //  Obtener comentarios
    public List<Comment> getComments(Long claimId) {
        Claim reclamo = repository.findById(claimId)
                .orElseThrow(() -> new RuntimeException("Reclamo no encontrado"));
        return commentRepository.findByReclamoOrderByCreatedAtDesc(reclamo);
    }

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
                .toList();
    }

    //  Filtro avanzado para OPERADOR
    public List<Claim> filterClaims(String estado, String categoria, String sortBy, String order) {
        Sort sort = Sort.by(order.equalsIgnoreCase("asc") ? Sort.Direction.ASC : Sort.Direction.DESC, sortBy);
        return repository.findByEstadoAndCategoria(estado, categoria, sort);
    }




}
