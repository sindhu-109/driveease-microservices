package com.driveease.booking.dto;

import com.driveease.booking.entity.Booking;

import java.time.LocalDate;

public class BookingResponse {

    private Long bookingId;
    private Long userId;
    private Long vehicleId;
    private LocalDate startDate;
    private LocalDate endDate;
    private String status;

    public BookingResponse() {
    }

    public BookingResponse(Booking booking) {

        this.bookingId = booking.getBookingId();
        this.userId = booking.getUserId();
        this.vehicleId = booking.getVehicleId();
        this.startDate = booking.getStartDate();
        this.endDate = booking.getEndDate();
        this.status = booking.getStatus();
    }

    public Long getBookingId() {
        return bookingId;
    }

    public void setBookingId(Long bookingId) {
        this.bookingId = bookingId;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public Long getVehicleId() {
        return vehicleId;
    }

    public void setVehicleId(Long vehicleId) {
        this.vehicleId = vehicleId;
    }

    public LocalDate getStartDate() {
        return startDate;
    }

    public void setStartDate(LocalDate startDate) {
        this.startDate = startDate;
    }

    public LocalDate getEndDate() {
        return endDate;
    }

    public void setEndDate(LocalDate endDate) {
        this.endDate = endDate;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}