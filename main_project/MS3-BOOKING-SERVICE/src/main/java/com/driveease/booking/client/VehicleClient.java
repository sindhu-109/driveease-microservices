package com.driveease.booking.client;

import com.driveease.booking.dto.VehicleResponse;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.*;

@FeignClient(
        name = "VEHICLE-SERVICE",
        configuration = FeignAuthInterceptor.class
)
public interface VehicleClient {

    @GetMapping("/ms2/vehicles/{id}")
    VehicleResponse getVehicle(
            @PathVariable("id") Long id
    );

    @PutMapping("/ms2/vehicles/{id}/status")
    VehicleResponse updateVehicleStatus(
            @PathVariable("id") Long id,
            @RequestParam("status") String status
    );
}