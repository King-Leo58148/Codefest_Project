package com.codewithlouis.codefest_project.model;


import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Data
@Table(name = "deals")
public class Deal {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Integer id;

    @OneToOne
    @JoinColumn(name = "bid_id", nullable = false)
    private Bid bid;

    @ManyToOne
    @JoinColumn(name = "pitch_id", nullable = false)
    private Pitch pitch;

    @ManyToOne
    @JoinColumn(name = "owner_id", nullable = false)
    private User owner;

    @ManyToOne
    @JoinColumn(name = "investor_id", nullable = false)
    private User investor;

    private boolean ownerSigned = false;
    private boolean investorSigned = false;
    private boolean mfiApproved = false;

    private String paystackRef;
    private boolean disbursed = false;

    @Enumerated(EnumType.STRING)
    private DealStatus status = DealStatus.PENDING_SIGNATURES;

    private LocalDateTime createdAt = LocalDateTime.now();
    private LocalDateTime disbursedAt;
}