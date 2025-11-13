package com.backend.cityfix.service;

import com.backend.cityfix.model.*;
import com.backend.cityfix.repository.*;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CommentService {

    private final CommentRepository commentRepository;
    private final UserRepository userRepository;
    private final ClaimRepository claimRepository;

    public CommentService(CommentRepository commentRepository, UserRepository userRepository, ClaimRepository claimRepository) {
        this.commentRepository = commentRepository;
        this.userRepository = userRepository;
        this.claimRepository = claimRepository;
    }

    public Comment addComment(Long claimId, String userEmail, String texto) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
        Claim claim = claimRepository.findById(claimId)
                .orElseThrow(() -> new RuntimeException("Reclamo no encontrado"));

        Comment comment = Comment.builder()
                .usuario(user)
                .reclamo(claim)
                .texto(texto)
                .build();

        return commentRepository.save(comment);
    }

    public List<Comment> getComments(Long claimId) {
        Claim claim = claimRepository.findById(claimId)
                .orElseThrow(() -> new RuntimeException("Reclamo no encontrado"));
        return commentRepository.findByReclamoOrderByCreatedAtDesc(claim);
    }
}
