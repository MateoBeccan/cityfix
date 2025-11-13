package com.backend.cityfix.service;

import com.backend.cityfix.model.*;
import com.backend.cityfix.repository.*;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class LikeService {

    private final LikeRepository likeRepository;
    private final UserRepository userRepository;
    private final ClaimRepository claimRepository;

    public LikeService(LikeRepository likeRepository, UserRepository userRepository, ClaimRepository claimRepository) {
        this.likeRepository = likeRepository;
        this.userRepository = userRepository;
        this.claimRepository = claimRepository;
    }

    public long countLikes(Long claimId) {
        Claim claim = claimRepository.findById(claimId)
                .orElseThrow(() -> new RuntimeException("Reclamo no encontrado"));
        return likeRepository.countByReclamo(claim);
    }

    public boolean toggleLike(Long claimId, String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
        Claim claim = claimRepository.findById(claimId)
                .orElseThrow(() -> new RuntimeException("Reclamo no encontrado"));

        return likeRepository.findByUsuarioAndReclamo(user, claim)
                .map(like -> {
                    likeRepository.delete(like);
                    return false; // Se quitó el like
                })
                .orElseGet(() -> {
                    Like newLike = Like.builder()
                            .usuario(user)
                            .reclamo(claim)
                            .build();
                    likeRepository.save(newLike);
                    return true; // Se agregó el like
                });
    }

    public List<Like> getLikes(Long claimId) {
        Claim claim = claimRepository.findById(claimId)
                .orElseThrow(() -> new RuntimeException("Reclamo no encontrado"));
        return likeRepository.findByReclamo(claim);
    }
}
