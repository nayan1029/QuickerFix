package com.quickerfix.repository;

import com.quickerfix.entity.Rating;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface RatingRepository extends JpaRepository<Rating, Long> {
    Optional<Rating> findByReportId(Long reportId);
    boolean existsByReportIdAndCitizenId(Long reportId, Long citizenId);
    @Query("SELECT AVG(r.score) FROM Rating r")
    Double findAverageScore();
}
