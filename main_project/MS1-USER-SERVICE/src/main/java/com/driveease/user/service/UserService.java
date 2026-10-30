package com.driveease.user.service;

import com.driveease.user.dto.AuthResponse;
import com.driveease.user.dto.SigninRequest;
import com.driveease.user.dto.SignupRequest;
import com.driveease.user.dto.SignupResponse;
import com.driveease.user.entity.User;
import com.driveease.user.repository.UserRepository;
import com.driveease.user.security.JwtService;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.http.HttpStatus;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public UserService(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            JwtService jwtService) {

        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    public SignupResponse signup(SignupRequest request) {

        String requestedRole = request.getRole();
        String role = "USER";
        if (requestedRole != null && !requestedRole.isBlank()) {
            if (!"USER".equalsIgnoreCase(requestedRole)
                    && !"ADMIN".equalsIgnoreCase(requestedRole)) {
                throw new UserException(HttpStatus.BAD_REQUEST, "Role must be USER or ADMIN");
            }
            role = requestedRole.toUpperCase(java.util.Locale.ROOT);
        }

        if (userRepository.existsByUsername(request.getUsername())) {
            throw new UserException(HttpStatus.CONFLICT, "Username already exists");
        }

        String encodedPassword =
                passwordEncoder.encode(request.getPassword());

        User user = new User(
                request.getUsername(),
                encodedPassword,
                role
        );

        userRepository.save(user);

        return new SignupResponse("User registered successfully", user.getUsername(), user.getRole());
    }

    public AuthResponse signin(SigninRequest request) {

        User user = userRepository
                .findByUsername(request.getUsername())
                .orElseThrow(() ->
                        new UserException(HttpStatus.UNAUTHORIZED, "Invalid username or password"));

        if (!passwordEncoder.matches(
                request.getPassword(),
                user.getPassword())) {

            throw new UserException(HttpStatus.UNAUTHORIZED, "Invalid username or password");
        }

        String token = jwtService.generateToken(
                user.getId(),
                user.getUsername(),
                user.getRole()
        );

        return new AuthResponse(
                token,
                user.getUsername(),
                user.getRole()
        );
    }

    public User getUserByUsername(String username) {

        return userRepository
                .findByUsername(username)
                .orElseThrow(() ->
                        new UserException(HttpStatus.NOT_FOUND, "User not found"));
    }
}
