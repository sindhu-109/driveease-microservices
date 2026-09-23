package com.driveease.vehicle.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

/**
 * InternalServiceFilter
 *
 * Runs before JwtAuthenticationFilter in the filter chain.
 *
 * Checks for the X-Internal-Service-Secret header.
 * If the header value matches the configured secret, the request is
 * authenticated as an internal service principal with ROLE_SERVICE.
 *
 * This allows Booking Service to call PUT /ms2/vehicles/{id}/status
 * without requiring an ADMIN JWT, while keeping that endpoint
 * blocked for regular USER JWTs sent directly from the browser.
 *
 * The header is NEVER exposed to the frontend or API Gateway —
 * it is only added by FeignAuthInterceptor inside Booking Service.
 */
@Component
public class InternalServiceFilter extends OncePerRequestFilter {

    @Value("${internal.service.secret}")
    private String internalServiceSecret;

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain)
            throws ServletException, IOException {

        String serviceSecret = request.getHeader("X-Internal-Service-Secret");

        if (serviceSecret != null
                && serviceSecret.equals(internalServiceSecret)) {

            // Authenticate as the internal service — grants ROLE_SERVICE
            UsernamePasswordAuthenticationToken authentication =
                    new UsernamePasswordAuthenticationToken(
                            "BOOKING-SERVICE",
                            null,
                            List.of(new SimpleGrantedAuthority("ROLE_SERVICE"))
                    );

            SecurityContextHolder.getContext().setAuthentication(authentication);
        }

        filterChain.doFilter(request, response);
    }
}
