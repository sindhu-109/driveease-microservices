package com.driveease.booking.service;

import com.driveease.booking.client.VehicleClient;
import com.driveease.booking.dto.BookingRequest;
import com.driveease.booking.dto.BookingResponse;
import com.driveease.booking.dto.VehicleResponse;
import com.driveease.booking.entity.Booking;
import com.driveease.booking.repository.BookingRepository;
import feign.FeignException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import org.springframework.http.HttpStatus;

@Service
public class BookingService {

    private final BookingRepository bookingRepository;
    private final VehicleClient vehicleClient;

    public BookingService(
            BookingRepository bookingRepository,
            VehicleClient vehicleClient) {
        this.bookingRepository = bookingRepository;
        this.vehicleClient = vehicleClient;
    }

    @Transactional
    public BookingResponse createBooking(Long userId, BookingRequest request) {
        if (request == null) {
            throw new BookingException(HttpStatus.BAD_REQUEST, "Booking request is required");
        }

        if (request.getStartDate() == null || request.getEndDate() == null || request.getVehicleId() == null
                || !request.getEndDate().isAfter(request.getStartDate())
                || !request.getStartDate().isAfter(LocalDate.now())) {
            throw new BookingException(HttpStatus.BAD_REQUEST, "Booking dates and vehicle are invalid");
        }

        bookingRepository.lockVehicle(request.getVehicleId());

        VehicleResponse vehicle;
        try {
            vehicle = vehicleClient.getVehicle(request.getVehicleId());
        } catch (FeignException.NotFound e) {
            throw new BookingException(HttpStatus.NOT_FOUND, "Vehicle not found");
        } catch (FeignException e) {
            throw new BookingException(HttpStatus.SERVICE_UNAVAILABLE, "Vehicle Service is unavailable");
        }

        if (!"AVAILABLE".equalsIgnoreCase(vehicle.getAvailabilityStatus())) {
            throw new BookingException(HttpStatus.CONFLICT, "Vehicle is currently not available");
        }

        List<Booking> overlappingBookings = bookingRepository.findOverlappingBookings(
                request.getVehicleId(),
                request.getStartDate(),
                request.getEndDate()
        );

        if (!overlappingBookings.isEmpty()) {
            throw new BookingException(HttpStatus.CONFLICT, "Vehicle is already booked for the selected dates");
        }

        Booking booking = new Booking();
        booking.setUserId(userId);
        booking.setVehicleId(request.getVehicleId());
        booking.setStartDate(request.getStartDate());
        booking.setEndDate(request.getEndDate());
        booking.setStatus("CONFIRMED");

        try {
            vehicleClient.updateVehicleStatus(request.getVehicleId(), "RESERVED");
        } catch (FeignException e) {
            throw new BookingException(HttpStatus.SERVICE_UNAVAILABLE, "Unable to reserve vehicle");
        }

        Booking savedBooking;
        try {
            savedBooking = bookingRepository.save(booking);
        } catch (RuntimeException e) {
            compensateVehicleStatus(request.getVehicleId(), "AVAILABLE");
            throw e;
        }

        return new BookingResponse(savedBooking);
    }

    public List<BookingResponse> getAllBookings() {
        return bookingRepository.findAll()
                .stream()
                .map(BookingResponse::new)
                .toList();
    }

    public BookingResponse getBookingById(Long id, Long userId, boolean admin) {
        Booking booking = findAuthorized(id, userId, admin);
        return new BookingResponse(booking);
    }

    public List<BookingResponse> getBookingsByUser(Long userId) {
        return bookingRepository.findByUserId(userId)
                .stream()
                .map(BookingResponse::new)
                .toList();
    }

    @Transactional
    public BookingResponse cancelBooking(Long id, Long userId, boolean admin) {
        Booking booking = findAuthorized(id, userId, admin);

        if ("COMPLETED".equals(booking.getStatus()) || "CANCELLED".equals(booking.getStatus())) {
            throw new BookingException(HttpStatus.CONFLICT, "Booking cannot be cancelled");
        }
        updateVehicle(booking, "AVAILABLE");
        booking.setStatus("CANCELLED");
        try {
            return new BookingResponse(bookingRepository.save(booking));
        } catch (RuntimeException e) {
            compensateVehicleStatus(booking.getVehicleId(), "RESERVED");
            throw e;
        }
    }

    @Transactional
    public BookingResponse startBooking(Long id, Long userId, boolean admin) {
        Booking booking = findAuthorized(id, userId, admin);

        if (!"CONFIRMED".equals(booking.getStatus())) {
            throw new BookingException(HttpStatus.CONFLICT, "Only confirmed bookings can be started");
        }

        LocalDate today = LocalDate.now();
        if (today.isBefore(booking.getStartDate())) {
            throw new BookingException(HttpStatus.CONFLICT, "Rental start date has not arrived");
        }
        updateVehicle(booking, "RENTED");
        booking.setStatus("ACTIVE");
        try {
            return new BookingResponse(bookingRepository.save(booking));
        } catch (RuntimeException e) {
            compensateVehicleStatus(booking.getVehicleId(), "RESERVED");
            throw e;
        }
    }

    @Transactional
    public BookingResponse returnVehicle(Long id, Long userId, boolean admin) {
        Booking booking = findAuthorized(id, userId, admin);

        if (!"ACTIVE".equals(booking.getStatus())) {
            throw new BookingException(HttpStatus.CONFLICT, "Only active bookings can be returned");
        }
        updateVehicle(booking, "AVAILABLE");
        booking.setStatus("COMPLETED");
        try {
            return new BookingResponse(bookingRepository.save(booking));
        } catch (RuntimeException e) {
            compensateVehicleStatus(booking.getVehicleId(), "RENTED");
            throw e;
        }
    }

    private Booking findAuthorized(Long id, Long userId, boolean admin) {
        Booking booking = bookingRepository.findById(id).orElseThrow(() ->
                new BookingException(HttpStatus.NOT_FOUND, "Booking not found"));
        if (!admin && !booking.getUserId().equals(userId)) {
            throw new BookingException(HttpStatus.FORBIDDEN, "You are not allowed to access this booking");
        }
        return booking;
    }

    private void updateVehicle(Booking booking, String status) {
        try { vehicleClient.updateVehicleStatus(booking.getVehicleId(), status); }
        catch (FeignException e) {
            throw new BookingException(HttpStatus.SERVICE_UNAVAILABLE, "Vehicle Service could not update the vehicle");
        }
    }

    private void compensateVehicleStatus(Long vehicleId, String status) {
        try { vehicleClient.updateVehicleStatus(vehicleId, status); }
        catch (FeignException ignored) { /* downstream state is reconciled by retrying the booking action */ }
    }
}
