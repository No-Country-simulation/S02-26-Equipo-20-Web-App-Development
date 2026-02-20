package com.nocountry.backend.repository;

import com.nocountry.backend.model.VideoOut;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface IVideoOutRepository extends JpaRepository<VideoOut,Long> {
}
