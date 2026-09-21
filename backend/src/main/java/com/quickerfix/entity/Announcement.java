package com.quickerfix.entity;
import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;
@Data @NoArgsConstructor @Entity @Table(name="announcements") public class Announcement {
 @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id;
 @Column(nullable=false) private String title;
 @Column(nullable=false, columnDefinition="TEXT") private String content;
 @ManyToOne(fetch=FetchType.LAZY, optional=false) @JoinColumn(name="created_by_id") private User createdBy;
 @Column(nullable=false) private String scope;
 private Long targetDistrictId; private Long targetCategoryId;
 @Column(nullable=false) private String priority;
 @Column(nullable=false) private LocalDateTime createdAt; private LocalDateTime expiresAt;
}
