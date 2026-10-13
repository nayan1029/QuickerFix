package com.quickerfix.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import java.time.LocalDateTime;

@Entity @Table(name = "duplicate_links", uniqueConstraints = @UniqueConstraint(columnNames = {"report_id"})) @Data @NoArgsConstructor
public class DuplicateLink {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @OneToOne(fetch = FetchType.LAZY, optional = false) @JoinColumn(name = "report_id", nullable = false) private Report report;
    @ManyToOne(fetch = FetchType.LAZY, optional = false) @JoinColumn(name = "canonical_report_id", nullable = false) private Report canonicalReport;
    @ManyToOne(fetch = FetchType.LAZY, optional = false) @JoinColumn(name = "linked_by_id", nullable = false) private User linkedBy;
    @Column(length = 500) private String note;
    @CreationTimestamp @Column(nullable = false, updatable = false) private LocalDateTime linkedAt;
}
