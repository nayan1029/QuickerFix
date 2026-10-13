package com.quickerfix.repository;

import com.quickerfix.entity.Comment;
import com.quickerfix.entity.Report;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CommentRepository extends JpaRepository<Comment, Long> {
    long countByReportId(Long reportId);
    List<Comment> findByReportIdOrderByCreatedAtAsc(Long reportId);
    List<Comment> findByReportOrderByCreatedAtAsc(Report report);
}
