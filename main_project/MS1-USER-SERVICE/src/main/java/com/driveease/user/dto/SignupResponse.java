package com.driveease.user.dto;

public class SignupResponse {
    private final String message;
    private final String username;
    private final String role;
    private final int status = 201;

    public SignupResponse(String message, String username, String role) {
        this.message = message;
        this.username = username;
        this.role = role;
    }

    public String getMessage() { return message; }
    public String getUsername() { return username; }
    public String getRole() { return role; }
    public int getStatus() { return status; }
}
