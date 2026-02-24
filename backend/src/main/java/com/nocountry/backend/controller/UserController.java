package com.nocountry.backend.controller;

import com.nocountry.backend.dto.users.UpdateProfileRequest;
import com.nocountry.backend.dto.users.UserResponse;
import com.nocountry.backend.model.User;
import com.nocountry.backend.service.IUserService;
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
public class UserController {

    private final IUserService userService;

    @PutMapping("/me")
    public ResponseEntity<UserResponse> updateProfile(@AuthenticationPrincipal User user,
                                                      @RequestBody @Valid UpdateProfileRequest updateProfileRequest){
        return ResponseEntity.ok(userService.updateProfile(user.getId(), updateProfileRequest));
    }
}
