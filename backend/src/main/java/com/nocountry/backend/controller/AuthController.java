package com.nocountry.backend.controller;

import org.springframework.web.bind.annotation.*;
import com.nocountry.backend.docs.IStandardApiResponses;
import com.nocountry.backend.dto.auth.AuthRequest;
import com.nocountry.backend.dto.auth.AuthResponse;
import com.nocountry.backend.dto.auth.RegisterRequest;
import com.nocountry.backend.dto.users.UserResponse;
import com.nocountry.backend.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
@Tag(name = "Authentication", description = "Endpoints para registro, login y gestión de sesión con JWT en cookie HTTP-only")
public class AuthController implements IStandardApiResponses {

    private final AuthService authService;

    @Operation(
            summary = "Registrar usuario",
            description = "Registra un nuevo usuario en el sistema y devuelve un JWT almacenado en una cookie HTTP-only."
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "Usuario registrado correctamente")
    })
    @PostMapping("/register")
    public ResponseEntity<UserResponse> register(
            @Valid @RequestBody RegisterRequest request,
            HttpServletResponse response) {
        AuthResponse authResponse = authService.register(request);

        ResponseCookie cookie = ResponseCookie.from("jwt", authResponse.token())
                .httpOnly(true)
                .secure(false) // poner true en producción (https)
                .path("/")
                .maxAge(60L * 60L * 10L)
                .sameSite("Lax")
                .build();

        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());

        return ResponseEntity.status(HttpStatus.CREATED).body(authResponse.user());
    }

    @Operation(
            summary = "Iniciar sesión",
            description = "Autentica las credenciales del usuario y devuelve un JWT en una cookie HTTP-only."
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Autenticación exitosa")
    })
    @PostMapping("/login")
    public ResponseEntity<UserResponse> login(
            @Valid @RequestBody AuthRequest request,
            HttpServletResponse response) {
        AuthResponse authResponse = authService.login(request);

        ResponseCookie cookie = ResponseCookie.from("jwt", authResponse.token())
                .httpOnly(true)
                .secure(false)
                .path("/")
                .maxAge(60L * 60L * 10L)
                .sameSite("Lax")
                .build();

        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());

        return ResponseEntity.ok(authResponse.user());
    }

    @Operation(
            summary = "Cerrar sesión",
            description = "Elimina la cookie JWT del navegador, invalidando la sesión actual.",
            security = @SecurityRequirement(name = "cookieAuth")
    )
    @ApiResponse(responseCode = "200", description = "Sesión cerrada correctamente")
    @PostMapping("/logout")
    public ResponseEntity<Void> logout(HttpServletResponse response) {
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

    @Operation(
            summary = "Obtener usuario autenticado",
            description = "Devuelve la información del usuario autenticado basado en el JWT almacenado en la cookie.",
            security = @SecurityRequirement(name = "cookieAuth")
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Información del usuario obtenida correctamente")
    })
    @GetMapping("/me")
    public ResponseEntity<UserResponse> me(Authentication authentication) {
        return ResponseEntity.ok(authService.me(authentication));
    }
}