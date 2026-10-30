package com.driveease.booking;

import com.driveease.booking.controller.BookingController;
import com.driveease.booking.security.JwtAuthenticationFilter;
import com.driveease.booking.security.JwtService;
import com.driveease.booking.security.SecurityConfig;
import com.driveease.booking.service.BookingService;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import javax.crypto.SecretKey;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.Mockito.verifyNoInteractions;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(BookingController.class)
@Import({SecurityConfig.class, JwtAuthenticationFilter.class, JwtService.class})
@TestPropertySource(properties = "jwt.secret=test-only-driveease-signing-secret-000000000000000000000000")
class BookingSecurityTest {
    private static final String SECRET = "test-only-driveease-signing-secret-000000000000000000000000";

    @Autowired private MockMvc mvc;
    @MockBean private BookingService bookingService;

    @Test
    void allBookingsRequiresAdminRole() throws Exception {
        String userToken = token(12L, "customer", "USER", new Date(System.currentTimeMillis() + 60_000));
        mvc.perform(get("/ms3/bookings").header("Authorization", "Bearer " + userToken))
                .andExpect(status().isForbidden());
        verifyNoInteractions(bookingService);

        String adminToken = token(13L, "operator", "ADMIN", new Date(System.currentTimeMillis() + 60_000));
        mvc.perform(get("/ms3/bookings").header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk());
    }

    @Test
    void missingInvalidAndExpiredTokensReturnUnauthorized() throws Exception {
        mvc.perform(get("/ms3/bookings")).andExpect(status().isUnauthorized());
        mvc.perform(get("/ms3/bookings").header("Authorization", "Bearer not-a-jwt"))
                .andExpect(status().isUnauthorized());

        String expiredToken = token(14L, "former-user", "USER", new Date(System.currentTimeMillis() - 10_000));
        mvc.perform(get("/ms3/bookings").header("Authorization", "Bearer " + expiredToken))
                .andExpect(status().isUnauthorized());
    }

    private String token(Long id, String username, String role, Date expiration) {
        SecretKey key = Keys.hmacShaKeyFor(SECRET.getBytes(StandardCharsets.UTF_8));
        return Jwts.builder().subject(username).claim("userId", id).claim("role", role)
                .issuedAt(new Date(System.currentTimeMillis() - 1_000)).expiration(expiration)
                .signWith(key).compact();
    }
}
