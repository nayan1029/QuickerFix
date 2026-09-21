package com.quickerfix.repository;
import com.quickerfix.entity.*;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
public interface AnnouncementReadRepository extends JpaRepository<AnnouncementRead,Long> { Optional<AnnouncementRead> findByAnnouncementAndUser(Announcement a, User u); long countByUser(User u); }
