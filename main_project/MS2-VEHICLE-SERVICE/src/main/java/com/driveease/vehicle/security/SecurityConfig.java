package com.driveease.vehicle.security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;

import org.springframework.security.config.http.SessionCreationPolicy;

import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;
    private final InternalServiceFilter internalServiceFilter;

    public SecurityConfig(
            JwtAuthenticationFilter jwtAuthenticationFilter,
            InternalServiceFilter internalServiceFilter) {

        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
        this.internalServiceFilter   = internalServiceFilter;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(
            HttpSecurity http)
            throws Exception {

        http
            .csrf(csrf -> csrf.disable())

            .sessionManagement(session ->
                session.sessionCreationPolicy(
                    SessionCreationPolicy.STATELESS
                )
            )

            .authorizeHttpRequests(auth -> auth

                // Actuator — open
                .requestMatchers("/actuator/**").permitAll()

                // READ operations — any authenticated user (USER, ADMIN, or SERVICE)
                .requestMatchers(HttpMethod.GET, "/ms2/vehicles/**").authenticated()

                // Vehicle status update — ADMIN or internal BOOKING-SERVICE
                // ROLE_SERVICE is granted by InternalServiceFilter when the
                // correct X-Internal-Service-Secret header is present.
                .requestMatchers(HttpMethod.PUT, "/ms2/vehicles/*/status")
                    .hasAnyRole("ADMIN", "SERVICE")

                // All other WRITE operations — ADMIN only
                .requestMatchers(HttpMethod.POST,   "/ms2/vehicles/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.PUT,    "/ms2/vehicles/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.DELETE, "/ms2/vehicles/**").hasRole("ADMIN")

                // Everything else — must be authenticated
                .anyRequest().authenticated()
            )

            // InternalServiceFilter runs FIRST so it can set ROLE_SERVICE
            // before JwtAuthenticationFilter processes the Bearer token.
            .addFilterBefore(
                internalServiceFilter,
                UsernamePasswordAuthenticationFilter.class
            )
            .addFilterAfter(
                jwtAuthenticationFilter,
                InternalServiceFilter.class
            );

        return http.build();
    }
}