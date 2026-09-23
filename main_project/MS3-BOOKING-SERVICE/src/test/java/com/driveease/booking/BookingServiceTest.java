package com.driveease.booking;

import com.driveease.booking.client.VehicleClient;
import com.driveease.booking.dto.BookingRequest;
import com.driveease.booking.repository.BookingRepository;
import com.driveease.booking.service.BookingService;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;

import java.time.LocalDate;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

class BookingServiceTest {

    @Test
    void createBookingShouldRejectInvalidDateRange() {
        BookingRepository bookingRepository = Mockito.mock(BookingRepository.class);
        VehicleClient vehicleClient = Mockito.mock(VehicleClient.class);

        BookingService bookingService = new BookingService(bookingRepository, vehicleClient);

        BookingRequest request = new BookingRequest();
        request.setVehicleId(1L);
        request.setStartDate(LocalDate.of(2026, 9, 28));
        request.setEndDate(LocalDate.of(2026, 9, 25));

        RuntimeException exception = assertThrows(RuntimeException.class,
                () -> bookingService.createBooking(10L, request));

        assertEquals("End date must be after start date", exception.getMessage());
    }
}
