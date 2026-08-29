package com.quickerfix.entity;

import com.quickerfix.enums.ReportStatus;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "status_history")
public class StatusHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "report_id")
    private Report report;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "changed_by_id")
    private User changedBy;

    @Enumerated(EnumType.STRING)
    private ReportStatus oldStatus;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ReportStatus newStatus;

    private String remark;

    @CreationTimestamp
    private LocalDateTime changedAt;
}
