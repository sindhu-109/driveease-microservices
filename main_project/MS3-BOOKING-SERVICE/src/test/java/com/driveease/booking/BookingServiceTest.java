package com.driveease.booking;

import com.driveease.booking.client.VehicleClient;
import com.driveease.booking.dto.BookingRequest;
import com.driveease.booking.repository.BookingRepository;
import com.driveease.booking.service.BookingService;
import com.driveease.booking.entity.Booking;
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

        assertEquals("Booking dates and vehicle are invalid", exception.getMessage());
    }

    @Test
    void validBookingReservesVehicleAndPersistsBooking() {
        BookingRepository repository = Mockito.mock(BookingRepository.class);
        VehicleClient client = Mockito.mock(VehicleClient.class);
        BookingService service = new BookingService(repository, client);
        var vehicle = new com.driveease.booking.dto.VehicleResponse();
        vehicle.setAvailabilityStatus("AVAILABLE");
        Mockito.when(client.getVehicle(1L)).thenReturn(vehicle);
        Mockito.when(repository.findOverlappingBookings(Mockito.eq(1L), Mockito.any(), Mockito.any()))
                .thenReturn(java.util.List.of());
        Mockito.when(repository.save(Mockito.any())).thenAnswer(invocation -> invocation.getArgument(0));
        BookingRequest request = new BookingRequest();
        request.setVehicleId(1L);
        request.setStartDate(LocalDate.now().plusDays(2));
        request.setEndDate(LocalDate.now().plusDays(3));

        var result = service.createBooking(10L, request);

        assertEquals("CONFIRMED", result.getStatus());
        Mockito.verify(client).updateVehicleStatus(1L, "RESERVED");
        Mockito.verify(repository).lockVehicle(1L);
    }

    @Test
    void userCannotReadAnotherUsersBookingButAdminCan() {
        BookingRepository repository = Mockito.mock(BookingRepository.class);
        Booking booking = new com.driveease.booking.entity.Booking();
        booking.setBookingId(5L);
        booking.setUserId(10L);
        Mockito.when(repository.findById(5L)).thenReturn(java.util.Optional.of(booking));
        BookingService service = new BookingService(repository, Mockito.mock(VehicleClient.class));

        assertThrows(com.driveease.booking.service.BookingException.class,
                () -> service.getBookingById(5L, 20L, false));
        assertEquals(10L, service.getBookingById(5L, 20L, true).getUserId());
    }
}
