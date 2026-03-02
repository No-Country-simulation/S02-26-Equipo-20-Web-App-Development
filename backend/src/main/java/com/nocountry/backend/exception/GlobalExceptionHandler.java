package com.nocountry.backend.exception;

import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.support.DefaultMessageSourceResolvable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.io.IOException;
import java.time.LocalDateTime;

@RestControllerAdvice
@Slf4j
public class GlobalExceptionHandler {

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiResponseError> handleValidationException(
            HttpServletRequest request,
            MethodArgumentNotValidException ex) {

        String validationMessage = ex.getBindingResult()
                .getAllErrors()
                .stream()
                .findFirst()
                .map(DefaultMessageSourceResolvable::getDefaultMessage)
                .orElse("Invalid data");

        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(buildError("Validation Error", validationMessage, request));
    }

    @ExceptionHandler(VideoException.class)
    public ResponseEntity<ApiResponseError> handleVideoException(
            HttpServletRequest request,
            VideoException ex) {

        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(buildError("Video not found", ex.getMessage(), request));
    }

    @ExceptionHandler(UsernameNotFoundException.class)
    public ResponseEntity<ApiResponseError> handleUserException(
            HttpServletRequest request,
            UsernameNotFoundException ex) {

        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(buildError("User not found", ex.getMessage(), request));
    }

    @ExceptionHandler(AuthenticationException.class)
    public ResponseEntity<ApiResponseError> handleAuthenticationException(
            HttpServletRequest request,
            AuthenticationException ex) {

        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(buildError("Unauthorized", "Authentication failed", request));
    }

    @ExceptionHandler(java.io.IOException.class)
    public void handleIOException(HttpServletRequest request, IOException ex) {

        String message = ex.getMessage() != null ? ex.getMessage().toLowerCase() : "";

        if (message.contains("broken pipe") ||
                message.contains("connection reset") ||
                message.contains("anulado una conexión")) {

            log.debug("Cliente cerró la conexión durante streaming: {}", ex.getMessage());
            return;
        }

        log.error("IO error real: {}", ex.getMessage());
        throw new RuntimeException(ex);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponseError> handleGlobalException(
            HttpServletRequest request,
            Exception ex) {

        log.error("Unexpected error: {}", ex.getMessage());
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(buildError("Internal Server Error",
                        "An unexpected error occurred",
                        request));
    }

    private ApiResponseError buildError(String title, String message, HttpServletRequest request) {
        return new ApiResponseError(
                title,
                message,
                request.getRequestURL().toString(),
                request.getMethod(),
                LocalDateTime.now()
        );
    }
}
