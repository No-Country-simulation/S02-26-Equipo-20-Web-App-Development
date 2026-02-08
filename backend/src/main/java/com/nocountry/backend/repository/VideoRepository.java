package com.nocountry.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.nocountry.backend.model.Video;

public interface VideoRepository extends JpaRepository<Video, Long> {

}
