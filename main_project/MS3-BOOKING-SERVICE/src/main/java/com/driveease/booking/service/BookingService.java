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
            throw new RuntimeException("Booking request is required");
        }

        if (!request.getEndDate().isAfter(request.getStartDate())) {
            throw new RuntimeException("End date must be after start date");
        }

        VehicleResponse vehicle;
        try {
            vehicle = vehicleClient.getVehicle(request.getVehicleId());
        } catch (FeignException.NotFound e) {
            throw new RuntimeException("Vehicle not found");
        } catch (FeignException e) {
            throw new RuntimeException("Unable to communicate with Vehicle Service");
        }

        if (!"AVAILABLE".equalsIgnoreCase(vehicle.getAvailabilityStatus())) {
            throw new RuntimeException("Vehicle is currently not available");
        }

        List<Booking> overlappingBookings = bookingRepository.findOverlappingBookings(
                request.getVehicleId(),
                request.getStartDate(),
                request.getEndDate()
        );

        if (!overlappingBookings.isEmpty()) {
            throw new RuntimeException("Vehicle is already booked for the selected dates");
        }

        Booking booking = new Booking();
        booking.setUserId(userId);
        booking.setVehicleId(request.getVehicleId());
        booking.setStartDate(request.getStartDate());
        booking.setEndDate(request.getEndDate());
        booking.setStatus("CONFIRMED");

        Booking savedBooking = bookingRepository.save(booking);

        try {
            vehicleClient.updateVehicleStatus(request.getVehicleId(), "RESERVED");
        } catch (FeignException e) {
            bookingRepository.delete(savedBooking);
            throw new RuntimeException("Unable to reserve vehicle");
        }

        return new BookingResponse(savedBooking);
    }

    public List<BookingResponse> getAllBookings() {
        return bookingRepository.findAll()
                .stream()
                .map(BookingResponse::new)
                .toList();
    }

    public BookingResponse getBookingById(Long id) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Booking not found with ID: " + id));
        return new BookingResponse(booking);
    }

    public List<BookingResponse> getBookingsByUser(Long userId) {
        return bookingRepository.findByUserId(userId)
                .stream()
                .map(BookingResponse::new)
                .toList();
    }

    @Transactional
    public BookingResponse cancelBooking(Long id, Long userId) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Booking not found"));

        if (!booking.getUserId().equals(userId)) {
            throw new RuntimeException("You are not allowed to cancel this booking");
        }

        if ("COMPLETED".equals(booking.getStatus()) || "CANCELLED".equals(booking.getStatus())) {
            throw new RuntimeException("Booking cannot be cancelled");
        }

        booking.setStatus("CANCELLED");
        Booking updatedBooking = bookingRepository.save(booking);

        try {
            vehicleClient.updateVehicleStatus(booking.getVehicleId(), "AVAILABLE");
        } catch (FeignException e) {
            throw new RuntimeException("Booking cancelled but vehicle status update failed");
        }

        return new BookingResponse(updatedBooking);
    }

    @Transactional
    public BookingResponse startBooking(Long id, Long userId) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Booking not found"));

        if (!booking.getUserId().equals(userId)) {
            throw new RuntimeException("You are not allowed to start this booking");
        }

        if (!"CONFIRMED".equals(booking.getStatus())) {
            throw new RuntimeException("Only confirmed bookings can be started");
        }

        LocalDate today = LocalDate.now();
        if (today.isBefore(booking.getStartDate())) {
            throw new RuntimeException("Rental start date has not arrived");
        }

        booking.setStatus("ACTIVE");
        Booking updatedBooking = bookingRepository.save(booking);

        try {
            vehicleClient.updateVehicleStatus(booking.getVehicleId(), "RENTED");
        } catch (FeignException e) {
            throw new RuntimeException("Unable to update vehicle to RENTED");
        }

        return new BookingResponse(updatedBooking);
    }

    @Transactional
    public BookingResponse returnVehicle(Long id, Long userId) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Booking not found"));

        if (!booking.getUserId().equals(userId)) {
            throw new RuntimeException("You are not allowed to return this booking");
        }

        if (!"ACTIVE".equals(booking.getStatus())) {
            throw new RuntimeException("Only active bookings can be returned");
        }

        booking.setStatus("COMPLETED");
        Booking updatedBooking = bookingRepository.save(booking);

        try {
            vehicleClient.updateVehicleStatus(booking.getVehicleId(), "AVAILABLE");
        } catch (FeignException e) {
            throw new RuntimeException("Booking completed but vehicle status update failed");
        }

        return new BookingResponse(updatedBooking);
    }
}
