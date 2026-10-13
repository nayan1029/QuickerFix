package com.quickerfix.dto.response;

import com.quickerfix.enums.AssignmentStatus;
import com.quickerfix.enums.ReportStatus;
import com.quickerfix.enums.Severity;

import java.time.LocalDateTime;

public record AssignmentResponse(Long id, AssignmentStatus status, ReportSummary report,
                                 LocalDateTime assignedAt, LocalDateTime acceptedAt,
                                 LocalDateTime completedAt, String rejectionReason) {
    public record ReportSummary(Long id, String title, String address, Severity severity,
                                ReportStatus status, String categoryName) { }
}
