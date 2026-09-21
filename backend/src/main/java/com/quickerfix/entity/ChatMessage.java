package com.quickerfix.entity;
import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;
@Data @NoArgsConstructor @Entity @Table(name = "chat_messages")
public class ChatMessage {
 @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
 @ManyToOne(fetch = FetchType.LAZY, optional = false) @JoinColumn(name = "report_id") private Report report;
 @ManyToOne(fetch = FetchType.LAZY, optional = false) @JoinColumn(name = "sender_id") private User sender;
 @ManyToOne(fetch = FetchType.LAZY, optional = false) @JoinColumn(name = "recipient_id") private User recipient;
 @Column(nullable = false, length = 1000) private String content;
 @Column(nullable = false) private boolean read;
 @Column(nullable = false) private LocalDateTime createdAt;
}
