package com.codewithlouis.codefest_project.model;


import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Data
@Table(name = "messages")
public class Message {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Integer id;

    @ManyToOne
    @JoinColumn(name = "deal_id", nullable = false)
    private Deal deal;

    @ManyToOne
    @JoinColumn(name = "sender_id", nullable = false)
    private User sender;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String content;

    private LocalDateTime sentAt = LocalDateTime.now();

    private LocalDateTime readAt;
}