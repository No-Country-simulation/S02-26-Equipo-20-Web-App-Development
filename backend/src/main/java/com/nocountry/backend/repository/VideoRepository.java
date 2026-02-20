package com.nocountry.backend.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.nocountry.backend.model.Video;

public interface VideoRepository extends JpaRepository<Video, Long> {
    List<Video> findByDeletedFalse();

    Optional<Video> findByIdAndDeletedFalse(Long id);
    List<Video> findByUserIdAndDeletedFalse(Long userId);
    Optional<Video> findByIdAndUserIdAndDeletedFalse(Long id, Long userId);
}