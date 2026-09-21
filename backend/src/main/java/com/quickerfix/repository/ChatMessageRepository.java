package com.quickerfix.repository;
import com.quickerfix.entity.ChatMessage;
import com.quickerfix.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
public interface ChatMessageRepository extends JpaRepository<ChatMessage, Long> {
 Page<ChatMessage> findByReportIdOrderByCreatedAtAsc(Long reportId, Pageable pageable);
 long countByRecipientAndReadFalse(User recipient);
 java.util.List<ChatMessage> findByReportIdAndRecipientAndReadFalse(Long reportId, User recipient);
}
