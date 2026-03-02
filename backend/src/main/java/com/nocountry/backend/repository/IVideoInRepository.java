package com.nocountry.backend.repository;

import java.util.List;
import java.util.Optional;

import com.nocountry.backend.model.VideoState;
import org.springframework.data.jpa.repository.JpaRepository;

import com.nocountry.backend.model.VideoIn;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;

public interface IVideoInRepository extends JpaRepository<VideoIn, Long> {
    Optional<VideoIn> findByIdAndUserIdAndDeletedFalse(Long id, Long userId);

    @Query("""
    SELECT vi.id, vo.id
    FROM VideoOut vo
    JOIN vo.videoIn vi
    JOIN vi.user u
    WHERE u.id = :userId
      AND vi.deleted = false
      AND vo.deleted = false
""")
    List<Object[]> findVideoInIdAndVideoOutIdByUser(Long userId);

    @Modifying
    @Query("UPDATE VideoIn vi SET vi.deleted = true WHERE vi.path = :path")
    void updateVideoInDeletedToTrue(String path);

    boolean existsByPathAndDeletedFalseAndVideoState(String path, VideoState videoState);
}