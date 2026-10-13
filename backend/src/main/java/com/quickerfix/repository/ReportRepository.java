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
import java.time.LocalDateTime;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.time.LocalDateTime;
import org.springframework.data.domain.PageRequest;

@Repository
public interface ReportRepository extends JpaRepository<Report, Long> {
    List<Report> findByCitizenId(Long citizenId);
    List<Report> findByCitizen(User citizen);
    List<Report> findByStatus(ReportStatus status);
    List<Report> findByStatusIn(List<ReportStatus> statuses);
    List<Report> findByCategoryId(Long categoryId);
    List<Report> findByCategoryIdAndStatusInAndMarkedAsDuplicateFalseAndCreatedAtAfter(Long categoryId, List<ReportStatus> statuses, LocalDateTime after, PageRequest page);
    Page<Report> findAll(Pageable pageable);
    long countByCategory(Category category);
    List<Report> findAllByStatusNotOrderByPriorityScoreDesc(ReportStatus status);
    List<Report> findTop10ByStatusNotOrderByPriorityScoreDesc(ReportStatus status);

    @Query("select r from Report r where " +
            "(:includeClosed = true or r.status <> :closedStatus) and " +
            "(:status is null or r.status = :status) and " +
            "(:categoryId is null or r.category.id = :categoryId) and " +
            "(:query is null or lower(r.title) like concat('%', lower(:query), '%') or " +
            "lower(coalesce(r.address, '')) like concat('%', lower(:query), '%'))")
    Page<Report> searchQueue(@Param("includeClosed") boolean includeClosed,
                             @Param("closedStatus") ReportStatus closedStatus,
                             @Param("status") ReportStatus status,
                             @Param("categoryId") Long categoryId,
                             @Param("query") String query,
                             Pageable pageable);

    @Query("select r.status, count(r) from Report r where r.createdAt >= :from and r.createdAt < :to and (:categoryId is null or r.category.id = :categoryId) group by r.status")
    List<Object[]> aggregateStatuses(@Param("from") LocalDateTime from, @Param("to") LocalDateTime to, @Param("categoryId") Long categoryId);

    @Query("select r.category.name, count(r) from Report r where r.createdAt >= :from and r.createdAt < :to and (:categoryId is null or r.category.id = :categoryId) group by r.category.name")
    List<Object[]> aggregateCategories(@Param("from") LocalDateTime from, @Param("to") LocalDateTime to, @Param("categoryId") Long categoryId);

    @Query("select count(r) from Report r where r.status <> :closed and r.createdAt >= :from and r.createdAt < :to and (:categoryId is null or r.category.id = :categoryId) and r.createdAt >= :ageFrom and r.createdAt < :ageTo")
    long countBacklogAge(@Param("closed") ReportStatus closed, @Param("from") LocalDateTime from, @Param("to") LocalDateTime to,
                         @Param("categoryId") Long categoryId, @Param("ageFrom") LocalDateTime ageFrom, @Param("ageTo") LocalDateTime ageTo);

    @Query("select r.createdAt, r.closedAt from Report r where r.status = :closed and r.closedAt is not null and r.createdAt >= :from and r.createdAt < :to and (:categoryId is null or r.category.id = :categoryId) order by r.closedAt desc")
    Page<Object[]> recentResolutionTimes(@Param("closed") ReportStatus closed, @Param("from") LocalDateTime from, @Param("to") LocalDateTime to,
                                         @Param("categoryId") Long categoryId, Pageable pageable);
    
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
