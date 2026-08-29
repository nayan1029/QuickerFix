package com.quickerfix.service;

import com.quickerfix.dto.response.NotificationResponse;
import com.quickerfix.entity.Notification;
import com.quickerfix.entity.Report;
import com.quickerfix.entity.User;
import com.quickerfix.enums.NotificationType;
import com.quickerfix.enums.ReportStatus;
import com.quickerfix.exception.ResourceNotFoundException;
import com.quickerfix.repository.NotificationRepository;
import com.quickerfix.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;

    public void createNotification(User recipient, String title, String message, NotificationType type, Long relatedReportId) {
        Notification notification = new Notification();
        notification.setRecipient(recipient);
        notification.setTitle(title);
        notification.setMessage(message);
        notification.setType(type);
        notification.setRelatedReportId(relatedReportId);
        notification.setRead(false);
        notification.setCreatedAt(LocalDateTime.now());
        
        notificationRepository.save(notification);
    }

    public void notifyStatusChange(Report report, ReportStatus newStatus) {
        String title = "Status Update: " + report.getTitle();
        String message = "";
        
        switch (newStatus) {
            case VERIFIED:
                message = "Your report '" + report.getTitle() + "' has been verified and will be assigned soon.";
                break;
            case ASSIGNED:
                message = "A worker has been assigned to your report '" + report.getTitle() + "'.";
                break;
            case IN_PROGRESS:
                message = "Work has started on your report '" + report.getTitle() + "'.";
                break;
            case RESOLVED:
                message = "Your report '" + report.getTitle() + "' has been resolved. Please confirm.";
                break;
            case CLOSED:
                message = "Your report '" + report.getTitle() + "' has been closed. Thank you!";
                break;
            case REOPENED:
                message = "Your report '" + report.getTitle() + "' has been reopened and will be worked on again.";
                break;
            default:
                message = "The status of your report '" + report.getTitle() + "' has changed to " + newStatus.name() + ".";
                break;
        }

        createNotification(report.getCitizen(), title, message, NotificationType.STATUS_UPDATE, report.getId());
    }

    public List<NotificationResponse> getUserNotifications(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
                
        return notificationRepository.findByRecipientOrderByCreatedAtDesc(user)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public long getUnreadCount(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return notificationRepository.countByRecipientAndReadFalse(user);
    }

    public void markAsRead(Long notificationId, String userEmail) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new ResourceNotFoundException("Notification not found"));
                
        if (!notification.getRecipient().getEmail().equals(userEmail)) {
            throw new IllegalArgumentException("Not authorized to modify this notification");
        }
        
        notification.setRead(true);
        notificationRepository.save(notification);
    }

    public void markAllAsRead(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
                
        List<Notification> unreadNotifications = notificationRepository.findByRecipientAndReadFalse(user);
        unreadNotifications.forEach(n -> n.setRead(true));
        notificationRepository.saveAll(unreadNotifications);
    }
    
    private NotificationResponse mapToResponse(Notification notification) {
        NotificationResponse response = new NotificationResponse();
        response.setId(notification.getId());
        response.setTitle(notification.getTitle());
        response.setMessage(notification.getMessage());
        response.setType(notification.getType().name());
        response.setRead(notification.isRead());
        response.setRelatedReportId(notification.getRelatedReportId());
        response.setCreatedAt(notification.getCreatedAt());
        return response;
    }
}
