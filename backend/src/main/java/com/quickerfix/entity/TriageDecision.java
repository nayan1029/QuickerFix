package com.quickerfix.entity;

import com.quickerfix.enums.Severity;
import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import java.time.LocalDateTime;

@Entity @Table(name = "triage_decisions") @Data @NoArgsConstructor
public class TriageDecision {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @ManyToOne(fetch = FetchType.LAZY, optional = false) @JoinColumn(name = "report_id") private Report report;
    @ManyToOne(fetch = FetchType.LAZY, optional = false) @JoinColumn(name = "reviewer_id") private User reviewer;
    @Column(nullable = false) private Long suggestedCategoryId;
    @Column(nullable = false, length = 120) private String suggestedCategoryName;
    @Enumerated(EnumType.STRING) @Column(nullable = false) private Severity suggestedSeverity;
    @Column(nullable = false) private double confidence;
    @Column(nullable = false, length = 80) private String source;
    @Column(nullable = false) private Long chosenCategoryId;
    @Enumerated(EnumType.STRING) @Column(nullable = false) private Severity chosenSeverity;
    @Column(length = 500) private String note;
    @CreationTimestamp @Column(nullable = false, updatable = false) private LocalDateTime reviewedAt;
}
