package com.backend.cityfix.repository;

import com.backend.cityfix.model.Status;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface StatusRepository extends JpaRepository<Status, Long> {
    Optional<Status> findByNombre(String nombre);
}