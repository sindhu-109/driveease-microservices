package com.driveease.user;

import com.driveease.user.controller.UserController;
import com.driveease.user.security.JwtAuthenticationFilter;
import com.driveease.user.security.JwtService;
import com.driveease.user.security.SecurityConfig;
import com.driveease.user.dto.SignupResponse;
import com.driveease.user.service.UserService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;

@WebMvcTest(UserController.class)
@Import({SecurityConfig.class, JwtAuthenticationFilter.class, JwtService.class})
@TestPropertySource(properties = "jwt.secret=test-only-driveease-signing-secret-000000000000000000000000")
class UserSecurityTest {
    @Autowired private MockMvc mvc;
    @Autowired private JwtService jwtService;
    @MockBean private UserService userService;

    @Test
    void signupIsPublic() throws Exception {
        when(userService.signup(org.mockito.ArgumentMatchers.any()))
                .thenReturn(new SignupResponse("ok", "new-user", "USER"));
        mvc.perform(post("/ms1/signup").contentType(MediaType.APPLICATION_JSON)
                        .content("{\"username\":\"new-user\",\"password\":\"password123\",\"role\":\"USER\"}"))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.username").value("new-user"))
                .andExpect(jsonPath("$.role").value("USER"));
    }

    @Test
    void adminSignupReturnsAdminRole() throws Exception {
        when(userService.signup(org.mockito.ArgumentMatchers.any()))
                .thenReturn(new SignupResponse("ok", "new-admin", "ADMIN"));
        mvc.perform(post("/ms1/signup").contentType(MediaType.APPLICATION_JSON)
                        .content("{\"username\":\"new-admin\",\"password\":\"password123\",\"role\":\"ADMIN\"}"))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.username").value("new-admin"))
                .andExpect(jsonPath("$.role").value("ADMIN"));
    }

    @Test
    void profileRejectsMissingAndInvalidTokens() throws Exception {
        mvc.perform(get("/ms1/profile")).andExpect(status().isUnauthorized());
        mvc.perform(get("/ms1/profile").header("Authorization", "Bearer invalid-token"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void profileAcceptsValidUserToken() throws Exception {
        String token = jwtService.generateToken(7L, "alice", "USER");
        mvc.perform(get("/ms1/profile").header("Authorization", "Bearer " + token))
                .andExpect(status().isOk());
    }
}
