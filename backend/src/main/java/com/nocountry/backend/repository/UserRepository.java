package com.nocountry.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.nocountry.backend.model.User;

public interface UserRepository extends JpaRepository<User, Long> {

}
