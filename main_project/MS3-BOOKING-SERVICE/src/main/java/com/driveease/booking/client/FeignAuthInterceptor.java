package com.driveease.booking.client;

import feign.RequestInterceptor;

import jakarta.servlet.http.HttpServletRequest;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

@Configuration
public class FeignAuthInterceptor {

    /**
     * Shared secret injected from application.properties.
     * Sent as X-Internal-Service-Secret on every Feign call to Vehicle Service.
     * Vehicle Service reads this header in InternalServiceFilter to grant
     * ROLE_SERVICE authority, which allows the status-update PUT endpoint.
     */
    @Value("${internal.service.secret}")
    private String internalServiceSecret;

    @Bean
    public RequestInterceptor requestInterceptor() {

        return requestTemplate -> {

            // Always attach the internal service secret so Vehicle Service
            // can identify this as a trusted inter-service call.
            requestTemplate.header(
                    "X-Internal-Service-Secret",
                    internalServiceSecret
            );

            // Also forward the end-user JWT when one is present.
            // Vehicle Service uses it for GET endpoints (authenticated()).
            ServletRequestAttributes attributes =
                    (ServletRequestAttributes)
                            RequestContextHolder.getRequestAttributes();

            if (attributes == null) {
                return;
            }

            HttpServletRequest request = attributes.getRequest();

            String authorization = request.getHeader("Authorization");

            if (authorization != null
                    && authorization.startsWith("Bearer ")) {

                requestTemplate.header("Authorization", authorization);
            }
        };
    }
}
