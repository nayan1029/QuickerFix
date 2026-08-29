package com.quickerfix.dto.response;

import com.quickerfix.enums.NotificationType;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class NotificationResponse {
    private Long id;
    private String title;
    private String message;
    private NotificationType type;
    private boolean read;
    private Long relatedReportId;
    private LocalDateTime createdAt;
}
