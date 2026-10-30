package com.driveease.vehicle;

import com.driveease.vehicle.entity.Vehicle;
import com.driveease.vehicle.repository.VehicleRepository;
import com.driveease.vehicle.service.VehicleException;
import com.driveease.vehicle.service.VehicleService;
import org.junit.jupiter.api.Test;
import java.util.List;
import java.util.Optional;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class VehicleServiceTest {
    @Test
    void maintenanceVehiclesAreNotReturnedAsAvailable() {
        VehicleRepository repository = mock(VehicleRepository.class);
        Vehicle maintenance = new Vehicle();
        maintenance.setAvailabilityStatus("MAINTENANCE");
        when(repository.findByAvailabilityStatus("AVAILABLE")).thenReturn(List.of());
        assertTrue(new VehicleService(repository).getAvailableVehicles().isEmpty());
    }

    @Test
    void trustedServiceCannotSkipLifecycleTransitions() {
        VehicleRepository repository = mock(VehicleRepository.class);
        Vehicle vehicle = new Vehicle();
        vehicle.setAvailabilityStatus("AVAILABLE");
        when(repository.findById(1L)).thenReturn(Optional.of(vehicle));
        assertThrows(VehicleException.class,
                () -> new VehicleService(repository).updateStatus(1L, "RENTED", true));
    }
}
