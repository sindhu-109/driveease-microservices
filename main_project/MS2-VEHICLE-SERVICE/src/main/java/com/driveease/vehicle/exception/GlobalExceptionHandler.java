package com.driveease.vehicle.exception;

import org.springframework.http.ResponseEntity;

import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.HashMap;
import java.util.Map;
import com.driveease.vehicle.service.VehicleException;
import org.springframework.http.HttpStatus;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(VehicleException.class)
    public ResponseEntity<?> handleVehicleException(VehicleException ex) {
        return ResponseEntity.status(ex.getStatus()).body(Map.of("error", ex.getMessage()));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<?> handleUnexpected(Exception ex) {

        Map<String, Object> response =
                new HashMap<>();

        response.put("status", 500);
        response.put("message", "An unexpected error occurred");

        return ResponseEntity
                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(response);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<?> handleValidationException(
            MethodArgumentNotValidException ex) {

        Map<String, Object> response =
                new HashMap<>();

        String message = ex.getBindingResult()
                .getFieldError()
                .getDefaultMessage();

        response.put("status", 400);
        response.put("message", message);

        return ResponseEntity
                .badRequest()
                .body(response);
    }
}
