package com.nocountry.backend.auth;

public record RegisterRequest(String name, String lastname, String email, String password, String country) {

}