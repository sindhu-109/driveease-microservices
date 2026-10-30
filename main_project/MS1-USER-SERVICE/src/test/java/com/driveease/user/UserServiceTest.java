package com.driveease.user;

import com.driveease.user.dto.SignupRequest;
import com.driveease.user.dto.SigninRequest;
import com.driveease.user.entity.User;
import com.driveease.user.repository.UserRepository;
import com.driveease.user.security.JwtService;
import com.driveease.user.service.UserService;
import com.driveease.user.service.UserException;
import org.junit.jupiter.api.Test;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;
import java.util.Optional;

class UserServiceTest {
    @Test
    void signupHashesPasswordAndAlwaysAssignsUserRole() {
        UserRepository repository = mock(UserRepository.class);
        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
        UserService service = new UserService(repository, encoder,
                new JwtService("test-only-driveease-signing-secret-000000000000000000000000"));
        SignupRequest request = new SignupRequest();
        request.setUsername("ordinary");
        request.setPassword("correct horse battery staple");
        request.setRole("USER");

        var response = service.signup(request);

        assertEquals("ordinary", response.getUsername());
        assertEquals("USER", response.getRole());
        verify(repository).save(argThat(user -> user.getRole().equals("USER")
                && !user.getPassword().equals(request.getPassword())
                && encoder.matches(request.getPassword(), user.getPassword())));
    }

    @Test
    void adminSignupCreatesAdminAccountWithoutInvitation() {
        UserRepository repository = mock(UserRepository.class);
        UserService service = new UserService(repository, new BCryptPasswordEncoder(),
                new JwtService("test-only-driveease-signing-secret-000000000000000000000000"));
        SignupRequest request = new SignupRequest();
        request.setUsername("would-be-admin");
        request.setPassword("password123");
        request.setRole("ADMIN");

        var response = service.signup(request);

        assertEquals("would-be-admin", response.getUsername());
        assertEquals("ADMIN", response.getRole());
        verify(repository).save(argThat(user -> user.getRole().equals("ADMIN")
                && new BCryptPasswordEncoder().matches("password123", user.getPassword())));
    }

    @Test
    void signupRejectsUnsupportedRole() {
        UserRepository repository = mock(UserRepository.class);
        UserService service = new UserService(repository, new BCryptPasswordEncoder(),
                new JwtService("test-only-driveease-signing-secret-000000000000000000000000"));
        SignupRequest request = new SignupRequest();
        request.setUsername("invalid-role");
        request.setPassword("password123");
        request.setRole("SUPERADMIN");

        UserException exception = assertThrows(UserException.class, () -> service.signup(request));
        assertEquals(org.springframework.http.HttpStatus.BAD_REQUEST, exception.getStatus());
        verify(repository, never()).save(any());
    }

    @Test
    void signinReturnsStoredRoleAndJwtRoleClaim() {
        UserRepository repository = mock(UserRepository.class);
        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
        JwtService jwt = new JwtService("test-only-driveease-signing-secret-000000000000000000000000");
        UserService service = new UserService(repository, encoder, jwt);
        User admin = new User("fleet-admin", encoder.encode("password123"), "ADMIN");
        admin.setId(42L);
        when(repository.findByUsername("fleet-admin")).thenReturn(Optional.of(admin));
        SigninRequest request = new SigninRequest();
        request.setUsername("fleet-admin");
        request.setPassword("password123");

        var response = service.signin(request);

        assertEquals("ADMIN", response.getRole());
        assertEquals("ADMIN", jwt.extractRole(response.getToken()));
        assertEquals("fleet-admin", response.getUsername());
    }

    @Test
    void signinRejectsInvalidPassword() {
        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
        UserRepository repository = mock(UserRepository.class);
        User user = new User("member", encoder.encode("correct-password"), "USER");
        when(repository.findByUsername("member")).thenReturn(Optional.of(user));
        UserService service = new UserService(repository, encoder,
                new JwtService("test-only-driveease-signing-secret-000000000000000000000000"));
        SigninRequest request = new SigninRequest();
        request.setUsername("member");
        request.setPassword("incorrect-password");

        UserException exception = assertThrows(UserException.class, () -> service.signin(request));
        assertEquals(org.springframework.http.HttpStatus.UNAUTHORIZED, exception.getStatus());
    }
}
