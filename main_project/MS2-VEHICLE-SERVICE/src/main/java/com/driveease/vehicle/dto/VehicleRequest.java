package com.driveease.vehicle.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;

public class VehicleRequest {

    @NotBlank(message = "Vehicle type is required")
    private String type;

    @NotBlank(message = "Vehicle model is required")
    private String model;

    @NotNull(message = "Rental price is required")
    @DecimalMin(value = "0.0", inclusive = false,
            message = "Rental price must be greater than zero")
    private BigDecimal rentalPrice;

    public VehicleRequest() {
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public String getModel() {
        return model;
    }

    public void setModel(String model) {
        this.model = model;
    }

    public BigDecimal getRentalPrice() {
        return rentalPrice;
    }

    public void setRentalPrice(BigDecimal rentalPrice) {
        this.rentalPrice = rentalPrice;
    }
}