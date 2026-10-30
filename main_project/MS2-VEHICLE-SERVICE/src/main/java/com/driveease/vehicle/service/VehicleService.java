package com.driveease.vehicle.service;

import com.driveease.vehicle.dto.VehicleRequest;
import com.driveease.vehicle.dto.VehicleResponse;
import com.driveease.vehicle.entity.Vehicle;
import com.driveease.vehicle.repository.VehicleRepository;

import org.springframework.stereotype.Service;

import java.util.List;
import org.springframework.http.HttpStatus;

@Service
public class VehicleService {

    private final VehicleRepository vehicleRepository;

    public VehicleService(VehicleRepository vehicleRepository) {
        this.vehicleRepository = vehicleRepository;
    }

    public VehicleResponse createVehicle(VehicleRequest request) {

        Vehicle vehicle = new Vehicle();

        vehicle.setType(request.getType());
        vehicle.setModel(request.getModel());
        vehicle.setRentalPrice(request.getRentalPrice());
        vehicle.setAvailabilityStatus("AVAILABLE");

        Vehicle savedVehicle = vehicleRepository.save(vehicle);

        return new VehicleResponse(savedVehicle);
    }

    public List<VehicleResponse> getAllVehicles() {

        return vehicleRepository.findAll()
                .stream()
                .map(VehicleResponse::new)
                .toList();
    }

    public VehicleResponse getVehicleById(Long id) {

        Vehicle vehicle = vehicleRepository.findById(id)
                .orElseThrow(() ->
                        new VehicleException(HttpStatus.NOT_FOUND, "Vehicle not found"));

        return new VehicleResponse(vehicle);
    }

    public VehicleResponse updateVehicle(
            Long id,
            VehicleRequest request) {

        Vehicle vehicle = vehicleRepository.findById(id)
                .orElseThrow(() ->
                        new VehicleException(HttpStatus.NOT_FOUND, "Vehicle not found"));

        vehicle.setType(request.getType());
        vehicle.setModel(request.getModel());
        vehicle.setRentalPrice(request.getRentalPrice());

        Vehicle updatedVehicle = vehicleRepository.save(vehicle);

        return new VehicleResponse(updatedVehicle);
    }

    public void deleteVehicle(Long id) {

        Vehicle vehicle = vehicleRepository.findById(id)
                .orElseThrow(() ->
                        new VehicleException(HttpStatus.NOT_FOUND, "Vehicle not found"));

        vehicleRepository.delete(vehicle);
    }

    public List<VehicleResponse> getAvailableVehicles() {

        return vehicleRepository
                .findByAvailabilityStatus("AVAILABLE")
                .stream()
                .map(VehicleResponse::new)
                .toList();
    }

    public VehicleResponse updateStatus(Long id, String status, boolean serviceCaller) {

        Vehicle vehicle = vehicleRepository.findById(id)
                .orElseThrow(() -> new VehicleException(HttpStatus.NOT_FOUND, "Vehicle not found"));

        String normalizedStatus = status == null ? "" : status.toUpperCase();

        if (!normalizedStatus.equals("AVAILABLE")
                && !normalizedStatus.equals("RESERVED")
                && !normalizedStatus.equals("RENTED")
                && !normalizedStatus.equals("MAINTENANCE")) {

            throw new VehicleException(HttpStatus.BAD_REQUEST,
                    "Invalid vehicle status. Use AVAILABLE, RESERVED, RENTED or MAINTENANCE"
            );
        }

        if (serviceCaller) {
            String current = vehicle.getAvailabilityStatus();
            boolean allowed = ("AVAILABLE".equals(current) && "RESERVED".equals(normalizedStatus))
                    || ("RESERVED".equals(current) && ("RENTED".equals(normalizedStatus) || "AVAILABLE".equals(normalizedStatus)))
                    || ("RENTED".equals(current) && "AVAILABLE".equals(normalizedStatus));
            if (!allowed) throw new VehicleException(HttpStatus.CONFLICT, "Invalid vehicle status transition");
        }

        vehicle.setAvailabilityStatus(normalizedStatus);

        Vehicle updatedVehicle = vehicleRepository.save(vehicle);

        return new VehicleResponse(updatedVehicle);
    }
}
