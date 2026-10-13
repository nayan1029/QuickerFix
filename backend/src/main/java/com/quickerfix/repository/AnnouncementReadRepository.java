package com.quickerfix.repository;
import com.quickerfix.entity.*;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
public interface AnnouncementReadRepository extends JpaRepository<AnnouncementRead,Long> {
 Optional<AnnouncementRead> findByAnnouncementAndUser(Announcement a, User u);
 long countByUser(User u);
 void deleteByAnnouncement(Announcement announcement);
 @org.springframework.data.jpa.repository.Query("select count(a) from Announcement a where a.scope = 'ALL' and (a.expiresAt is null or a.expiresAt > :now) and not exists (select r.id from AnnouncementRead r where r.announcement = a and r.user = :user)")
 long countUnreadPublicNotices(@org.springframework.data.repository.query.Param("user") User user,
                               @org.springframework.data.repository.query.Param("now") java.time.LocalDateTime now);
}
