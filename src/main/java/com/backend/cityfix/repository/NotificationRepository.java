package com.backend.cityfix.repository;

import com.backend.cityfix.model.Notification;
import com.backend.cityfix.model.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.*;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {

    List<Notification> findByUsuarioOrderByFechaDesc(User usuario);
    
    Page<Notification> findByUsuarioOrderByFechaDesc(User usuario, Pageable pageable);

    Long countByUsuarioAndLeidoFalse(User usuario);

    @Modifying
    @Query("UPDATE Notification n SET n.leido = true WHERE n.usuario.id = :userId AND n.leido = false")
    void markAllAsRead(Long userId);

    List<Notification> findByUsuarioAndLeidoFalseOrderByFechaDesc(User usuario);

    void deleteByUsuario(User usuario);


    List<Notification> findByReclamoId(Long reclamoId);
    
    @Modifying
    @Query("DELETE FROM Notification n WHERE n.fecha < :cutoff")
    void deleteByFechaBefore(LocalDateTime cutoff);
    
    @Query("SELECT COUNT(n) FROM Notification n WHERE n.usuario = :user AND n.leido = false")
    Long countUnreadByUser(User user);
}
