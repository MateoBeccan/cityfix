package com.backend.cityfix.repository;

import com.backend.cityfix.model.Like;
import com.backend.cityfix.model.User;
import com.backend.cityfix.model.Claim;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
import java.util.List;

public interface LikeRepository extends JpaRepository<Like, Long> {

    // Buscar si un usuario ya dio "like" a un reclamo
    Optional<Like> findByUsuarioAndReclamo(User usuario, Claim reclamo);

    // Contar likes totales de un reclamo
    long countByReclamo(Claim reclamo);

    // Obtener todos los likes de un reclamo
    List<Like> findByReclamo(Claim reclamo);

    // Saber si ya existe un like dado por ese usuario a ese reclamo
    boolean existsByUsuarioAndReclamo(User usuario, Claim reclamo);
}
