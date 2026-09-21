package com.quickerfix.service;
import com.quickerfix.entity.*;
import com.quickerfix.enums.Role;
import com.quickerfix.exception.ResourceNotFoundException;
import com.quickerfix.exception.UnauthorizedException;
import com.quickerfix.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;
@Service @RequiredArgsConstructor
public class ChatService {
 private final ChatMessageRepository messages; private final ReportRepository reports; private final UserRepository users; private final AssignmentRepository assignments;
 public List<ChatMessage> messages(Long reportId, String email, int page) { User user = current(email); authorize(reports.findById(reportId).orElseThrow(() -> new ResourceNotFoundException("Report not found")), user); return messages.findByReportIdOrderByCreatedAtAsc(reportId, PageRequest.of(Math.max(page, 0), 50)).getContent(); }
 public ChatMessage send(Long reportId, Long recipientId, String content, String email) { User sender = current(email); Report report = reports.findById(reportId).orElseThrow(() -> new ResourceNotFoundException("Report not found")); User recipient = users.findById(recipientId).orElseThrow(() -> new ResourceNotFoundException("Recipient not found")); authorize(report, sender); authorize(report, recipient); if (sender.getId().equals(recipient.getId())) throw new IllegalArgumentException("Recipient must be another participant"); ChatMessage m = new ChatMessage(); m.setReport(report); m.setSender(sender); m.setRecipient(recipient); m.setContent(content.trim()); m.setRead(false); m.setCreatedAt(LocalDateTime.now()); return messages.save(m); }
 public void read(Long id, String email) { ChatMessage m = messages.findById(id).orElseThrow(() -> new ResourceNotFoundException("Message not found")); if (!m.getRecipient().getEmail().equals(email)) throw new UnauthorizedException("Only the recipient may mark a message read"); m.setRead(true); messages.save(m); }
 public long unread(String email) { return messages.countByRecipientAndReadFalse(current(email)); }
 public void readAll(Long reportId, String email) { User user = current(email); Report report = reports.findById(reportId).orElseThrow(() -> new ResourceNotFoundException("Report not found")); authorize(report, user); var unread = messages.findByReportIdAndRecipientAndReadFalse(reportId, user); unread.forEach(m -> m.setRead(true)); messages.saveAll(unread); }
 private User current(String email) { return users.findByEmail(email).orElseThrow(() -> new ResourceNotFoundException("User not found")); }
 private void authorize(Report report, User user) { if (user.getRole() == Role.ADMIN || report.getCitizen().getId().equals(user.getId()) || assignments.findByReportId(report.getId()).stream().anyMatch(a -> a.getWorker().getId().equals(user.getId()))) return; throw new UnauthorizedException("You are not a participant in this report chat"); }
}
