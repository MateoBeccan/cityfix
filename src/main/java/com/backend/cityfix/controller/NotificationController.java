package com.backend.cityfix.controller;

import com.backend.cityfix.dto.NotificationDTO;
import com.backend.cityfix.model.Notification;
import com.backend.cityfix.service.NotificationService;
import lombok.RequiredArgsConstructor;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
@CrossOrigin("*")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;

    /** 📌 Obtener todas las notificaciones del usuario */
    @GetMapping
    public ResponseEntity<List<NotificationDTO>> getNotifications(
            @AuthenticationPrincipal UserDetails user) {

        return ResponseEntity.ok(
                notificationService.getNotifications(user.getUsername())
        );
    }
    
    /** 📌 Obtener notificaciones paginadas */
    @GetMapping("/paged")
    public ResponseEntity<Page<NotificationDTO>> getNotificationsPaged(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @AuthenticationPrincipal UserDetails user) {

        Pageable pageable = PageRequest.of(page, size);
        return ResponseEntity.ok(
                notificationService.getNotificationsPaged(user.getUsername(), pageable)
        );
    }

    /** 📌 Obtener solo no leídas */
    @GetMapping("/unread")
    public ResponseEntity<List<NotificationDTO>> getUnread(
            @AuthenticationPrincipal UserDetails user) {

        return ResponseEntity.ok(
                notificationService.getUnreadNotifications(user.getUsername())
        );
    }

    /** 📌 Contador de notificaciones no leídas */
    @GetMapping("/unread-count")
    public ResponseEntity<Long> getUnreadCount(
            @AuthenticationPrincipal UserDetails user) {

        return ResponseEntity.ok(
                notificationService.getUnreadCount(user.getUsername())
        );
    }

    /** 📌 Marcar TODAS como leídas */
    @PostMapping("/mark-all-read")
    @Transactional
    public ResponseEntity<Void> markAllAsRead(
            @AuthenticationPrincipal UserDetails user) {

        notificationService.markAsRead(user.getUsername());
        return ResponseEntity.ok().build();
    }

    /** 📌 Eliminar TODAS las notificaciones del usuario */
    @PostMapping("/clear")
    @Transactional
    public ResponseEntity<Void> clearAll(
            @AuthenticationPrincipal UserDetails user) {

        notificationService.clearAll(user.getUsername());
        return ResponseEntity.ok().build();
    }

    /** 📌 Obtener detalle de una notificación */
    @GetMapping("/{id}")
    public ResponseEntity<Notification> getNotificationById(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails user) {

        return ResponseEntity.ok(
                notificationService.getNotification(id, user.getUsername())
        );
    }

    /** 📌 Marcar una notificación como leída */
    @PostMapping("/{id}/read")
    @Transactional
    public ResponseEntity<Void> markOneAsRead(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails user) {

        notificationService.markOneAsRead(id, user.getUsername());
        return ResponseEntity.ok().build();
    }
}
