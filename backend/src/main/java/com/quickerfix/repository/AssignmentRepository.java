package com.quickerfix.repository;

import com.quickerfix.entity.Assignment;
import com.quickerfix.entity.Report;
import com.quickerfix.entity.User;
import com.quickerfix.enums.AssignmentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AssignmentRepository extends JpaRepository<Assignment, Long> {
    List<Assignment> findByWorkerId(Long workerId);
    List<Assignment> findByWorker(User worker);
    List<Assignment> findByReportId(Long reportId);
    Optional<Assignment> findByReportAndWorker(Report report, User worker);
    Optional<Assignment> findByReportIdAndStatus(Long reportId, AssignmentStatus status);
    Optional<Assignment> findTopByReportIdOrderByAssignedAtDesc(Long reportId);
}
