package com.quickerfix.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;
import java.util.Map;

@Data @NoArgsConstructor @AllArgsConstructor
public class AnalyticsResponse {
    private LocalDate from; private LocalDate to; private Long categoryId;
    private long totalReports; private long closedReports; private boolean lowSample;
    private Map<String, Long> reportsByStatus; private Map<String, Long> reportsByCategory;
    private Map<String, Long> backlogAgeBuckets;
    private Double medianResolutionHours; private Double p90ResolutionHours;
    private long resolutionSampleSize; private boolean resolutionSampleCapped;
}
