package com.nocountry.backend.controller;

import com.nocountry.backend.docs.IStandardApiResponses;
import com.nocountry.backend.dto.users.UpdateProfileRequest;
import com.nocountry.backend.dto.users.UserResponse;
import com.nocountry.backend.model.User;
import com.nocountry.backend.service.IUserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
@Tag(
        name = "Users",
        description = "Operaciones relacionadas con la gestión del perfil del usuario autenticado."
)
public class UserController implements IStandardApiResponses {

    private final IUserService userService;

    @Operation(
            summary = "Actualizar perfil del usuario autenticado",
            description = "Permite actualizar los datos del usuario actualmente autenticado. " +
                    "Requiere una sesión válida mediante JWT almacenado en cookie HTTP-only.",
            security = @SecurityRequirement(name = "cookieAuth")
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Perfil actualizado correctamente")
    })
    @PutMapping("/me")
    public ResponseEntity<UserResponse> updateProfile(@AuthenticationPrincipal User user,
                                                      @RequestBody @Valid UpdateProfileRequest updateProfileRequest) {
        return ResponseEntity.ok(userService.updateProfile(user.getId(), updateProfileRequest));
    }
}
