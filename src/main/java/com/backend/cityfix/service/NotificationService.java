package com.backend.cityfix.service;

import com.backend.cityfix.dto.NotificationDTO;
import com.backend.cityfix.model.*;
import com.backend.cityfix.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;
    private final ClaimRepository claimRepository;

    // Crear notificación genérica
    public void notifyUser(Long userId, Long claimId, String mensaje) {

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        Claim claim = claimRepository.findById(claimId)
                .orElseThrow(() -> new RuntimeException("Reclamo no encontrado"));

        Notification notification = Notification.builder()
                .usuario(user)
                .reclamo(claim)
                .titulo("Notificación")
                .tipo(NotificationType.SISTEMA)
                .mensaje(mensaje)
                .leido(false)
                .fecha(LocalDateTime.now())
                .build();

        notificationRepository.save(notification);
    }





    // Notificar comentario (opcional)
    public void notifyNewComment(User user, Claim claim, String comentario) {
        Notification n = Notification.builder()
                .usuario(claim.getUsuario())
                .reclamo(claim)
                .titulo("Nuevo comentario")
                .mensaje(user.getNombre() + " comentó: " + comentario)
                .tipo(NotificationType.COMENTARIO)
                .fecha(LocalDateTime.now())
                .leido(false)
                .build();

        notificationRepository.save(n);
    }



    // Listado de notificaciones con DTO
    public List<NotificationDTO> getNotifications(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        return notificationRepository.findByUsuarioOrderByFechaDesc(user)
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    // Listado paginado
    public Page<NotificationDTO> getNotificationsPaged(String email, Pageable pageable) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        Page<Notification> notifications = notificationRepository.findByUsuarioOrderByFechaDesc(user, pageable);
        
        return new PageImpl<>(
                notifications.stream().map(this::toDTO).collect(Collectors.toList()),
                pageable,
                notifications.getTotalElements()
        );
    }

    // Conteo de no leídas
    public Long getUnreadCount(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        return notificationRepository.countByUsuarioAndLeidoFalse(user);
    }

    // Marcar todas como leídas
    public void markAsRead(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        notificationRepository.markAllAsRead(user.getId());
    }

    public void notifyClaimStatusChange(Claim claim, String nuevoEstado) {
        Notification n = Notification.builder()
                .usuario(claim.getUsuario())
                .reclamo(claim)
                .titulo("Estado actualizado")
                .mensaje("Tu reclamo #" + claim.getId() + " cambió a " + nuevoEstado)
                .tipo(NotificationType.ESTADO)
                .fecha(LocalDateTime.now())
                .leido(false)
                .build();

        notificationRepository.save(n);
    }


    public List<NotificationDTO> getUnreadNotifications(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
        return notificationRepository.findByUsuarioAndLeidoFalseOrderByFechaDesc(user)
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public Notification getNotification(Long id, String email) {
        Notification n = notificationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Notificación no encontrada"));

        if (!n.getUsuario().getEmail().equals(email))
            throw new RuntimeException("No autorizado");

        return n;
    }

    public void markOneAsRead(Long id, String email) {
        Notification n = getNotification(id, email);
        n.setLeido(true);
        notificationRepository.save(n);
    }

    public void clearAll(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
        notificationRepository.deleteByUsuario(user);
    }

    // Eliminar notificaciones antiguas (más de 30 días)
    public void cleanOldNotifications() {
        LocalDateTime cutoff = LocalDateTime.now().minusDays(30);
        notificationRepository.deleteByFechaBefore(cutoff);
    }

    // Notificar nuevo like
    public void notifyNewLike(User liker, Claim claim) {
        // No notificar si el usuario se da like a sí mismo
        if (liker.getId().equals(claim.getUsuario().getId())) return;

        Notification n = Notification.builder()
                .usuario(claim.getUsuario())
                .reclamo(claim)
                .titulo("Nuevo like")
                .mensaje(liker.getNombre() + " le dio like a tu reclamo: " + claim.getTitulo())
                .tipo(NotificationType.SISTEMA)
                .fecha(LocalDateTime.now())
                .leido(false)
                .build();

        notificationRepository.save(n);
    }

    // Convertir a DTO
    private NotificationDTO toDTO(Notification n) {
        return NotificationDTO.builder()
                .id(n.getId())
                .titulo(n.getTitulo())
                .mensaje(n.getMensaje())
                .tipo(n.getTipo())
                .leido(n.isLeido())
                .fecha(n.getFecha())
                .reclamoId(n.getReclamo() != null ? n.getReclamo().getId() : null)
                .reclamoTitulo(n.getReclamo() != null ? n.getReclamo().getTitulo() : null)
                .build();
    }

}
