package com.nocountry.backend.exception;

import com.fasterxml.jackson.annotation.JsonFormat;

import java.time.LocalDateTime;

public record ApiResponseError(
        String backendMessage,
        String message,
        String url,
        String method,
        @JsonFormat(pattern = "yyyy/MM/dd HH:mm:ss")
        LocalDateTime timesTamp){
}

