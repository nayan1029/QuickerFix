package com.quickerfix.entity;
import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;
@Data @NoArgsConstructor @Entity @Table(name = "otp_records")
public class OtpRecord {
 @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
 @Column(nullable = false, length = 64) private String subjectHash;
 @Column(nullable = false) private String otpHash;
 @Column(nullable = false) private LocalDateTime expiresAt;
 @Column(nullable = false) private int attempts;
 @Column(nullable = false) private boolean verified;
 @Column(nullable = false) private LocalDateTime createdAt;
}
