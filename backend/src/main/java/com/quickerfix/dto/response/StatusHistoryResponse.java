package com.quickerfix.dto.response;

import com.quickerfix.enums.ReportStatus;
import java.time.LocalDateTime;

public record StatusHistoryResponse(ReportStatus oldStatus, ReportStatus newStatus,
                                    String actorName, String remark, LocalDateTime changedAt) { }
