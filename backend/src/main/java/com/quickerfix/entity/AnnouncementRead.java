package com.quickerfix.entity;
import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;
@Data @NoArgsConstructor @Entity @Table(name="announcement_reads", uniqueConstraints=@UniqueConstraint(columnNames={"announcement_id","user_id"})) public class AnnouncementRead {
 @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id;
 @ManyToOne(fetch=FetchType.LAZY, optional=false) @JoinColumn(name="announcement_id") private Announcement announcement;
 @ManyToOne(fetch=FetchType.LAZY, optional=false) @JoinColumn(name="user_id") private User user;
 @Column(nullable=false) private LocalDateTime readAt;
}
