package com.backend.cityfix.repository;

import com.backend.cityfix.model.Claim;
import com.backend.cityfix.model.Comment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface CommentRepository extends JpaRepository<Comment, Long> {
    List<Comment> findByReclamoOrderByCreatedAtDesc(Claim reclamo);
    @Query("SELECT COUNT(c) FROM Comment c WHERE c.reclamo = :reclamo")
    long countByReclamo(@Param("reclamo") Claim reclamo);

}
