package com.nocountry.backend.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.nocountry.backend.model.VideoIn;

public interface IVideoInRepository extends JpaRepository<VideoIn, Long> {
    Optional<VideoIn> findByIdAndUserIdAndDeletedFalse(Long id, Long userId);
}