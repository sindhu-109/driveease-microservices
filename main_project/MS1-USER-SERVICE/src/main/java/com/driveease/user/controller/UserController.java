package com.driveease.user.controller;

import com.driveease.user.dto.AuthResponse;
import com.driveease.user.dto.SigninRequest;
import com.driveease.user.dto.SignupRequest;
import com.driveease.user.entity.User;
import com.driveease.user.service.UserService;

import jakarta.validation.Valid;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/ms1")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @PostMapping("/signup")
    public ResponseEntity<?> signup(
            @Valid @RequestBody SignupRequest request) {

        String message = userService.signup(request);

        Map<String, Object> response = new HashMap<>();

        response.put("message", message);
        response.put("status", 201);

        return ResponseEntity.status(201).body(response);
    }

    @PostMapping("/signin")
    public ResponseEntity<AuthResponse> signin(
            @Valid @RequestBody SigninRequest request) {

        AuthResponse response = userService.signin(request);

        return ResponseEntity.ok(response);
    }

    @GetMapping("/profile")
    public ResponseEntity<?> profile(Authentication authentication) {

        Map<String, Object> response = new HashMap<>();

        response.put("message", "User service is working");
        response.put("authenticated", authentication != null);

        if (authentication != null) {
            response.put("username", authentication.getName());
        }

        return ResponseEntity.ok(response);
    }
}