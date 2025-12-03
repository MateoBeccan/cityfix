package com.backend.cityfix.repository;

import com.backend.cityfix.model.Claim;
import com.backend.cityfix.model.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface ClaimRepository extends JpaRepository<Claim, Long> {
    List<Claim> findByUsuario(User usuario);
    Page<Claim> findAll(Pageable pageable);
    @Query("""
        SELECT c FROM Claim c
        WHERE (:estado IS NULL OR LOWER(c.estado.nombre) = LOWER(:estado))
        AND (:categoria IS NULL OR LOWER(c.categoria.nombre) = LOWER(:categoria))
        """)
    List<Claim> findByEstadoAndCategoria(@org.springframework.lang.Nullable String estado,
                                         @org.springframework.lang.Nullable String categoria,
                                         org.springframework.data.domain.Sort sort);

    @Query("""
        SELECT c FROM Claim c
        WHERE (:estado IS NULL OR :estado = '' OR LOWER(c.estado.nombre) = LOWER(:estado))
        AND (:categoria IS NULL OR :categoria = '' OR LOWER(c.categoria.nombre) = LOWER(:categoria))
        """)
    Page<Claim> findByEstadoAndCategoria(@org.springframework.lang.Nullable String estado,
                                         @org.springframework.lang.Nullable String categoria,
                                         Pageable pageable);



}