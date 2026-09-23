package com.driveease.vehicle.dto;

import com.driveease.vehicle.entity.Vehicle;

import java.math.BigDecimal;

public class VehicleResponse {

    private Long vehicleId;
    private String type;
    private String model;
    private String availabilityStatus;
    private BigDecimal rentalPrice;

    public VehicleResponse() {
    }

    public VehicleResponse(Vehicle vehicle) {

        this.vehicleId = vehicle.getVehicleId();
        this.type = vehicle.getType();
        this.model = vehicle.getModel();
        this.availabilityStatus = vehicle.getAvailabilityStatus();
        this.rentalPrice = vehicle.getRentalPrice();
    }

    public Long getVehicleId() {
        return vehicleId;
    }

    public void setVehicleId(Long vehicleId) {
        this.vehicleId = vehicleId;
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

    public String getAvailabilityStatus() {
        return availabilityStatus;
    }

    public void setAvailabilityStatus(String availabilityStatus) {
        this.availabilityStatus = availabilityStatus;
    }

    public BigDecimal getRentalPrice() {
        return rentalPrice;
    }

    public void setRentalPrice(BigDecimal rentalPrice) {
        this.rentalPrice = rentalPrice;
    }
}