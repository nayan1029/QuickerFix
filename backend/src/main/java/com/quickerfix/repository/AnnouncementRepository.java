package com.quickerfix.repository;
import com.quickerfix.entity.Announcement;
import org.springframework.data.jpa.repository.JpaRepository;
import java.time.LocalDateTime;
import java.util.List;
public interface AnnouncementRepository extends JpaRepository<Announcement,Long> {
 List<Announcement> findByExpiresAtIsNullOrExpiresAtAfterOrderByCreatedAtDesc(LocalDateTime now);
}
