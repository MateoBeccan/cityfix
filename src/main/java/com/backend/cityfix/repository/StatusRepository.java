package com.backend.cityfix.repository;

import com.backend.cityfix.model.Status;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface StatusRepository extends JpaRepository<Status, Long> {
    Optional<Status> findByNombreIgnoreCase(String nombre);
}
