package com.quickerfix.dto.response;

import lombok.Builder;
import lombok.Data;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardResponse {
    private long totalReports;
    private long pendingReports;
    private long inProgressReports;
    private long resolvedReports;
    private long closedReports;
    private double resolutionRate;
    private Map<String, Long> reportsByCategory;
    private List<ReportResponse> highPriorityReports;
}
