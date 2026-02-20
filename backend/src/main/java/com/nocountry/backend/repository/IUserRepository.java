package com.nocountry.backend.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.nocountry.backend.model.User;
import org.springframework.stereotype.Repository;

@Repository
public interface IUserRepository extends JpaRepository<User, Long> {

    boolean existsByEmail(String email);

    List<User> findByDeletedFalse();

    Optional<User> findByIdAndDeletedFalse(Long id);

    Optional<User> findByEmail(String email);
}
