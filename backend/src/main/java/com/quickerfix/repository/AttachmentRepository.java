package com.quickerfix.repository;

import com.quickerfix.entity.Attachment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AttachmentRepository extends JpaRepository<Attachment, Long> {
    List<Attachment> findByReportId(Long reportId);
    List<Attachment> findByReportIdAndIsResolutionProof(Long reportId, boolean isResolutionProof);
}
