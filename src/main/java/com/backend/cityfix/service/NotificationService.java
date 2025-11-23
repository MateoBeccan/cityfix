package com.backend.cityfix.service;

import com.backend.cityfix.model.*;
import com.backend.cityfix.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

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
                .tipo("comentario")
                .build();

        notificationRepository.save(n);
    }


    // Listado de notificaciones
    public List<Notification> getNotifications(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        return notificationRepository.findByUsuarioOrderByFechaDesc(user);
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
                .tipo("estado")
                .build();

        notificationRepository.save(n);
    }

    public List<Notification> getUnreadNotifications(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
        return notificationRepository.findByUsuarioAndLeidoFalseOrderByFechaDesc(user);
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


}
