package com.codewithlouis.codefest_project.repository;

import com.codewithlouis.codefest_project.model.OfferType;
import com.codewithlouis.codefest_project.model.Pitch;
import com.codewithlouis.codefest_project.model.PitchStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface PitchRepository extends JpaRepository<Pitch, Integer> {
    List<Pitch> findByStatus(PitchStatus status);
    List<Pitch> findByOwnerEmail(String email);
    List<Pitch> findByStatusAndExpiresAtBefore(PitchStatus status, LocalDateTime time);

    @Query(value = "SELECT * FROM pitches p WHERE p.status = 'LIVE'" +
            " AND (:location IS NULL OR LOWER(p.location) LIKE LOWER(CONCAT('%', :location, '%')))" +
            " AND (:industry IS NULL OR LOWER(p.industry) LIKE LOWER(CONCAT('%', :industry, '%')))" +
            " AND (:offerType IS NULL OR p.offer_type = :offerType)" +
            " AND (:maxAmount IS NULL OR p.amount_needed <= :maxAmount)" +
            " AND (:minAmount IS NULL OR p.amount_needed >= :minAmount)",
            nativeQuery = true)
    List<Pitch> filterPitches(
            @Param("location") String location,
            @Param("industry") String industry,
            @Param("offerType") String offerType,
            @Param("minAmount") Double minAmount,
            @Param("maxAmount") Double maxAmount
    );
}