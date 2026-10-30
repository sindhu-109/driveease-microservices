package com.driveease.vehicle.service;

import org.springframework.http.HttpStatus;

public class VehicleException extends RuntimeException {
    private final HttpStatus status;
    public VehicleException(HttpStatus status, String message) { super(message); this.status = status; }
    public HttpStatus getStatus() { return status; }
}
