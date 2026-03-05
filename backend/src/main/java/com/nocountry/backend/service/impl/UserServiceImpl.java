package com.nocountry.backend.service.impl;

import com.nocountry.backend.dto.users.UpdateProfileRequest;
import com.nocountry.backend.dto.users.UserResponse;
import com.nocountry.backend.model.User;
import com.nocountry.backend.repository.IUserRepository;
import com.nocountry.backend.service.IUserService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import static com.nocountry.backend.mapper.UserMapper.mapToUserResponse;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements IUserService {

    private final IUserRepository userRepository;

    @Override
    @Transactional
    public UserResponse updateProfile(Long id, UpdateProfileRequest updateProfileRequest) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));

        user.setName(updateProfileRequest.name());
        user.setLastname(updateProfileRequest.lastname());

        return mapToUserResponse(user);
    }
}
