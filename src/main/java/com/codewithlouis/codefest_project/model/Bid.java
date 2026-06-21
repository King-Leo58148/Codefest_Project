package com.codewithlouis.codefest_project.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Data
@Table(name = "bids")
public class Bid {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Integer id;

    @ManyToOne
    @JoinColumn(name = "pitch_id", nullable = false)
    private Pitch pitch;

    @ManyToOne
    @JoinColumn(name = "investor_id", nullable = false)
    private User investor;

    @Column(nullable = false)
    private Double amount;

    @Enumerated(EnumType.STRING)
    private ReturnType returnType;

    private Double returnValue;

    private Integer timelineMonths;

    private String note;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private BidStatus status = BidStatus.PENDING;

    private LocalDateTime createdAt = LocalDateTime.now();
}