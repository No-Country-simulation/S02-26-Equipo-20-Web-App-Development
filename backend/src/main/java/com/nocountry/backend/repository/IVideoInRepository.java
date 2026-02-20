package com.nocountry.backend.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.nocountry.backend.model.VideoIn;

public interface VideoRepository extends JpaRepository<VideoIn, Long> {
    List<VideoIn> findByDeletedFalse();

    Optional<VideoIn> findByIdAndDeletedFalse(Long id);
    List<VideoIn> findByUserIdAndDeletedFalse(Long userId);
    Optional<VideoIn> findByIdAndUserIdAndDeletedFalse(Long id, Long userId);
}