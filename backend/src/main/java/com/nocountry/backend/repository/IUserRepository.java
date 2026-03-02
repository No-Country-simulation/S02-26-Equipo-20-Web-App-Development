package com.nocountry.backend.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.nocountry.backend.model.User;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface IUserRepository extends JpaRepository<User, Long> {

    boolean existsByEmail(String email);

    Optional<User> findByEmail(String email);

    @Modifying
    @Query("""
                UPDATE User u
                SET u.userFolderSize = COALESCE(u.userFolderSize, 0) + :size
                WHERE u.id = :userId
            """)
    void incrementFolderSize(Long userId, Long size);


    @Modifying
    @Query("""
                UPDATE User u
                SET u.userFolderSize =
                    CASE
                        WHEN COALESCE(u.userFolderSize,0) - :size < 0 THEN 0
                        ELSE COALESCE(u.userFolderSize,0) - :size
                    END
                WHERE u.id = :userId
            """)
    void decreaseFolderSize(Long userId, Long size);
}
