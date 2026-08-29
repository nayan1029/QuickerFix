package com.quickerfix.controller;

import com.quickerfix.dto.response.ApiResponse;
import com.quickerfix.dto.response.NotificationResponse;
import com.quickerfix.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<NotificationResponse>>> getUserNotifications() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        List<NotificationResponse> notifications = notificationService.getUserNotifications(email);
        return ResponseEntity.ok(new ApiResponse<>(true, "Notifications fetched", notifications));
    }

    @GetMapping("/unread-count")
    public ResponseEntity<ApiResponse<Long>> getUnreadCount() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        long count = notificationService.getUnreadCount(email);
        return ResponseEntity.ok(new ApiResponse<>(true, "Unread count fetched", count));
    }

    @PutMapping("/{id}/read")
    public ResponseEntity<ApiResponse<Void>> markAsRead(@PathVariable Long id) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        notificationService.markAsRead(id, email);
        return ResponseEntity.ok(new ApiResponse<>(true, "Notification marked as read", null));
    }

    @PutMapping("/read-all")
    public ResponseEntity<ApiResponse<Void>> markAllAsRead() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        notificationService.markAllAsRead(email);
        return ResponseEntity.ok(new ApiResponse<>(true, "All notifications marked as read", null));
    }
}
