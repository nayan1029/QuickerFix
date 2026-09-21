package com.quickerfix.dto.response;

import com.quickerfix.enums.ReportStatus;
import com.quickerfix.enums.Severity;
import lombok.Builder;
import lombok.Data;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReportResponse {
    private Long id;
    private String title;
    private String description;
    private String categoryName;
    private String categoryIcon;
    private String citizenName;
    private Long citizenId;
    private Double latitude;
    private Double longitude;
    private String address;
    private Severity severity;
    private ReportStatus status;
    private Integer priorityScore;
    private Integer upvoteCount;
    private Integer duplicateCount;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime resolvedAt;
    private List<String> attachmentUrls;
    private Integer commentCount;
    private String assignedWorkerName;
    private boolean markedAsDuplicate;
    private Long duplicateOfReportId;
    private LocalDateTime closedAt;
}
