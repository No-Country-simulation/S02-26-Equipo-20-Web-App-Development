package com.nocountry.backend.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.nocountry.backend.model.User;

public interface UserRepository extends JpaRepository<User, Long> {
    List<User> findByDeletedFalse();

    Optional<User> findByIdAndDeletedFalse(Long id);
}
