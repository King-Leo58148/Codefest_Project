package com.codewithlouis.codefest_project.model;


import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Data
@Table(name = "pitches")
public class Pitch {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Integer id;

    @ManyToOne
    @JoinColumn(name = "owner_id", nullable = false)
    private User owner;

    @Column(nullable = false)
    private String businessName;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String description;

    private String shortDescription;

    private String imageUrl;

    private String videoUrl;

    @Column(nullable = false)
    private Double monthlyIncome;

    @Column(nullable = false)
    private Double amountNeeded;

    private Double amountRaised = 0.0;
    private Double minimumInvestment;
    private Double preMoneyValuation;
    private Double revenue;
    private Integer foundedYear;
    private LocalDate campaignEndDate;

    @Enumerated(EnumType.STRING)
    private OfferType offerType;

    private Double offerValue;

    private String location;

    @Enumerated(EnumType.STRING)
    private Industry industry;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PitchStatus status = PitchStatus.PENDING;

    private LocalDateTime createdAt = LocalDateTime.now();
    private LocalDateTime expiresAt;
}