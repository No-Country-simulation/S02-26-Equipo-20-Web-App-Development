package com.nocountry.backend.controller;

import lombok.RequiredArgsConstructor;

import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.nocountry.backend.dto.auth.AuthRequest;
import com.nocountry.backend.dto.auth.AuthResponse;
import com.nocountry.backend.dto.auth.RegisterRequest;
import com.nocountry.backend.service.AuthService;

import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/v1/auth") // En caso de cambiarla, modificarla también en el controlador y avisar al
                                // equipo de frontend
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<?> register(
            @Valid @RequestBody RegisterRequest request,
            HttpServletResponse response) {
        AuthResponse authResponse = authService.register(request);

        ResponseCookie cookie = ResponseCookie.from("jwt", authResponse.token())
                .httpOnly(true)
                .secure(false) // poner true en producción (https)
                .path("/")
                .maxAge(60 * 60 * 10)
                .sameSite("Lax")
                .build();

        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());

        return ResponseEntity.status(HttpStatus.CREATED).build();
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(
            @Valid @RequestBody AuthRequest request,
            HttpServletResponse response) {
        AuthResponse authResponse = authService.login(request);

        ResponseCookie cookie = ResponseCookie.from("jwt", authResponse.token())
                .httpOnly(true)
                .secure(false)
                .path("/")
                .maxAge(60 * 60 * 10)
                .sameSite("Lax")
                .build();

        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());

        return ResponseEntity.ok().build();
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(HttpServletResponse response) {
        ResponseCookie cookie = ResponseCookie.from("jwt", "")
                .httpOnly(true)
                .secure(false)
                .path("/")
                .maxAge(0) // Expira inmediatamente
                .sameSite("Lax")
                .build();

        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());

        return ResponseEntity.ok().build();
    }
}