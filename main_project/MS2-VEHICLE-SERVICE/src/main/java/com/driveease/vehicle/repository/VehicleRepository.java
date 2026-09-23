package com.driveease.vehicle.repository;

import com.driveease.vehicle.entity.Vehicle;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface VehicleRepository extends JpaRepository<Vehicle, Long> {

	List<Vehicle> findByAvailabilityStatus(String availabilityStatus);
}
