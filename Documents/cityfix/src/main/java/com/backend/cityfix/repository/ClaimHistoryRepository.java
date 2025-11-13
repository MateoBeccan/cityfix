package com.backend.cityfix.repository;

import com.backend.cityfix.model.ClaimHistory;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ClaimHistoryRepository extends JpaRepository<ClaimHistory, Long> {
    List<ClaimHistory> findByClaimIdOrderByChangedAtDesc(Long claimId);
}