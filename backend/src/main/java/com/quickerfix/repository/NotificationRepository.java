package com.quickerfix.repository;

import com.quickerfix.entity.Notification;
import com.quickerfix.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {
    List<Notification> findByRecipientIdOrderByCreatedAtDesc(Long userId);
    List<Notification> findByRecipientOrderByCreatedAtDesc(User recipient);
    List<Notification> findByRecipientIdAndRead(Long userId, boolean read);
    List<Notification> findByRecipientAndReadFalse(User recipient);
    long countByRecipientIdAndRead(Long userId, boolean read);
    long countByRecipientAndReadFalse(User recipient);
}
