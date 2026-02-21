package com.nocountry.backend.repository;

import com.nocountry.backend.model.VideoOut;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface IVideoOutRepository extends JpaRepository<VideoOut,Long> {
    Optional<VideoOut> findByIdAndVideoInUserIdAndDeletedFalse(
            Long id,
            Long userId
    );
}
