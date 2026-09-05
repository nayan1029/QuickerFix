package com.quickerfix.repository;

import com.quickerfix.entity.Report;
import com.quickerfix.entity.User;
import com.quickerfix.entity.Category;
import com.quickerfix.enums.ReportStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReportRepository extends JpaRepository<Report, Long> {
    List<Report> findByCitizenId(Long citizenId);
    List<Report> findByCitizen(User citizen);
    List<Report> findByStatus(ReportStatus status);
    List<Report> findByStatusIn(List<ReportStatus> statuses);
    List<Report> findByCategoryId(Long categoryId);
    Page<Report> findAll(Pageable pageable);
    long countByCategory(Category category);
    List<Report> findAllByStatusNotOrderByPriorityScoreDesc(ReportStatus status);
    long countByReportId(Long reportId);
    
    @Query("SELECT r FROM Report r WHERE " +
           "r.status NOT IN ('CLOSED') AND " +
           "r.category.id = :categoryId AND " +
           "r.markedAsDuplicate = false AND " +
           "(6371000 * acos(cos(radians(:lat)) * cos(radians(r.latitude)) * " +
           "cos(radians(r.longitude) - radians(:lng)) + " +
           "sin(radians(:lat)) * sin(radians(r.latitude)))) < :radiusMeters")
    List<Report> findNearbyOpenReports(@Param("lat") Double lat, @Param("lng") Double lng, @Param("radiusMeters") Double radiusMeters, @Param("categoryId") Long categoryId);
    
    List<Report> findByStatusOrderByPriorityScoreDesc(ReportStatus status);
    List<Report> findTop10ByOrderByPriorityScoreDesc();
    long countByStatus(ReportStatus status);
    
    @Query("SELECT r.category.name, COUNT(r) FROM Report r GROUP BY r.category.name")
    List<Object[]> countByCategory();
}
