package com.backend.cityfix.repository;

import com.backend.cityfix.model.Notification;
import com.backend.cityfix.model.User;
import org.springframework.data.jpa.repository.*;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {

    List<Notification> findByUsuarioOrderByFechaDesc(User usuario);

    Long countByUsuarioAndLeidoFalse(User usuario);

    @Modifying
    @Query("UPDATE Notification n SET n.leido = true WHERE n.usuario.id = :userId")
    void markAllAsRead(Long userId);

    List<Notification> findByUsuarioAndLeidoFalseOrderByFechaDesc(User usuario);

    void deleteByUsuario(User usuario);

}
