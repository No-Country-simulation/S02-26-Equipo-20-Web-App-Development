package com.nocountry.backend.service;

import com.nocountry.backend.dto.UserResponse;
import com.nocountry.backend.dto.auth.AuthRequest;
import com.nocountry.backend.dto.auth.AuthResponse;
import com.nocountry.backend.dto.auth.RegisterRequest;
import com.nocountry.backend.model.User;
import com.nocountry.backend.repository.IUserRepository;
import com.nocountry.backend.security.JwtUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final IUserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtils jwtUtils;
    private final AuthenticationManager authenticationManager;

    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.email())) {
            throw new IllegalStateException("El email ya está registrado");
        }
        var user = buildUser(request);

        userRepository.save(user);

        var jwtToken = jwtUtils.generateToken(user);
        return new AuthResponse(
                jwtToken,
                mapToUserResponse(user));
    }

    public AuthResponse login(AuthRequest request) {

        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.email(),
                        request.password()));

        var user = userRepository.findByEmail(request.email())
                .orElseThrow(() -> new UsernameNotFoundException("Usuario no encontrado"));

        var jwtToken = jwtUtils.generateToken(user);
        return new AuthResponse(
                jwtToken,
                mapToUserResponse(user));
    }

    private User buildUser(RegisterRequest request) {
        var user = new User();
        user.setName(request.name());
        user.setLastname(request.lastname());
        user.setEmail(request.email());
        user.setPassword(passwordEncoder.encode(request.password()));
        user.setEnabled(true);
        return user;
    }

    private UserResponse mapToUserResponse(User user) {
        return new UserResponse(
                user.getId(),
                user.getName(),
                user.getLastname(),
                user.getEmail());
    }

    public UserResponse me(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new IllegalStateException("Usuario no autenticado");
        }

        String email = authentication.getName();

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("Usuario no encontrado"));

        return mapToUserResponse(user);
    }
}