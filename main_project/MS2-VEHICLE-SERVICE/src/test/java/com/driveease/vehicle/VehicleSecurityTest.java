package com.driveease.vehicle;

import com.driveease.vehicle.controller.VehicleController;
import com.driveease.vehicle.security.InternalServiceFilter;
import com.driveease.vehicle.security.JwtAuthenticationFilter;
import com.driveease.vehicle.security.JwtService;
import com.driveease.vehicle.security.SecurityConfig;
import com.driveease.vehicle.service.VehicleService;
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

import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(VehicleController.class)
@Import({SecurityConfig.class, InternalServiceFilter.class, JwtAuthenticationFilter.class, JwtService.class})
@TestPropertySource(properties = {
        "jwt.secret=test-only-driveease-signing-secret-000000000000000000000000",
        "internal.service.secret=test-only-driveease-internal-secret-000000000000000000"
})
class VehicleSecurityTest {
    private static final String JWT_SECRET = "test-only-driveease-signing-secret-000000000000000000000000";
    private static final String INTERNAL_SECRET = "test-only-driveease-internal-secret-000000000000000000";

    @Autowired private MockMvc mvc;
    @MockBean private VehicleService vehicleService;

    @Test
    void vehicleWritesRequireAdminButAllowAdmin() throws Exception {
        String payload = "{\"type\":\"CAR\",\"model\":\"Demo\",\"rentalPrice\":100}";
        mvc.perform(post("/ms2/vehicles").header("Authorization", "Bearer " + token("USER"))
                        .contentType("application/json").content(payload))
                .andExpect(status().isForbidden());
        verifyNoInteractions(vehicleService);

        mvc.perform(post("/ms2/vehicles").header("Authorization", "Bearer " + token("ADMIN"))
                        .contentType("application/json").content(payload))
                .andExpect(status().isCreated());
        verify(vehicleService).createVehicle(org.mockito.ArgumentMatchers.any());
    }

    @Test
    void trustedBookingServiceCanStillUpdateVehicleStatus() throws Exception {
        mvc.perform(put("/ms2/vehicles/1/status?status=RESERVED")
                        .header("X-Internal-Service-Secret", INTERNAL_SECRET))
                .andExpect(status().isOk());
        verify(vehicleService).updateStatus(1L, "RESERVED", true);
    }

    private String token(String role) {
        SecretKey key = Keys.hmacShaKeyFor(JWT_SECRET.getBytes(StandardCharsets.UTF_8));
        return Jwts.builder().subject("demo").claim("userId", 1L).claim("role", role)
                .issuedAt(new Date(System.currentTimeMillis() - 1_000))
                .expiration(new Date(System.currentTimeMillis() + 60_000))
                .signWith(key).compact();
    }
}
