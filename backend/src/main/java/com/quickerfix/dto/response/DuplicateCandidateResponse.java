package com.quickerfix.dto.response;

import com.quickerfix.enums.ReportStatus;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data @NoArgsConstructor @AllArgsConstructor
public class DuplicateCandidateResponse {
    private Long reportId;
    private String title;
    private String categoryName;
    private ReportStatus status;
    private double distanceMeters;
    private double similarity;
    private String reason;
    private LocalDateTime createdAt;
}
