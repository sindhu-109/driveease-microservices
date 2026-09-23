package com.driveease.booking.repository;

import com.driveease.booking.entity.Booking;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;

public interface BookingRepository
        extends JpaRepository<Booking, Long> {

    @Query("""
        SELECT b
        FROM Booking b
        WHERE b.vehicleId = :vehicleId
        AND b.status NOT IN ('CANCELLED', 'COMPLETED')
        AND b.startDate < :endDate
        AND b.endDate > :startDate
        """)
    List<Booking> findOverlappingBookings(
            @Param("vehicleId") Long vehicleId,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate
    );

    List<Booking> findByUserId(Long userId);

    List<Booking> findByVehicleId(Long vehicleId);
}