package com.quickerfix.dto.response;

import java.time.LocalDateTime;

public record ChatMessageResponse(Long id, Long reportId, Long senderId, String senderName,
                                 Long recipientId, String recipientName, String content,
                                 boolean read, LocalDateTime createdAt) {}
