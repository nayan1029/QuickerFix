package com.quickerfix.service;

import com.quickerfix.dto.request.AssignRequest;
import com.quickerfix.dto.response.ReportResponse;
import com.quickerfix.entity.Assignment;
import com.quickerfix.entity.Report;
import com.quickerfix.entity.User;
import com.quickerfix.enums.AssignmentStatus;
import com.quickerfix.enums.ReportStatus;
import com.quickerfix.enums.Role;
import com.quickerfix.exception.InvalidStatusTransitionException;
import com.quickerfix.exception.ResourceNotFoundException;
import com.quickerfix.exception.UnauthorizedException;
import com.quickerfix.repository.AssignmentRepository;
import com.quickerfix.repository.ReportRepository;
import com.quickerfix.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AssignmentService {

    private final AssignmentRepository assignmentRepository;
    private final ReportRepository reportRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;
    private final ReportService reportService;

    @Transactional
    public Assignment assignWorker(Long reportId, AssignRequest request, String adminEmail) {
        Report report = reportRepository.findById(reportId)
                .orElseThrow(() -> new ResourceNotFoundException("Report not found"));
        User admin = userRepository.findByEmail(adminEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Admin not found"));
        User worker = userRepository.findById(request.getWorkerId())
                .orElseThrow(() -> new ResourceNotFoundException("Worker not found"));

        if (report.getStatus() != ReportStatus.VERIFIED && report.getStatus() != ReportStatus.REOPENED) {
            throw new InvalidStatusTransitionException("Report must be VERIFIED or REOPENED to be assigned");
        }
        if (worker.getRole() != Role.WORKER) {
            throw new IllegalArgumentException("User is not a worker");
        }

        Assignment assignment = new Assignment();
        assignment.setReport(report);
        assignment.setWorker(worker);
        assignment.setAssignedBy(admin);
        assignment.setStatus(AssignmentStatus.PENDING);
        assignment = assignmentRepository.save(assignment);

        report.setStatus(ReportStatus.ASSIGNED);
        reportRepository.save(report);

        notificationService.notifyStatusChange(report, ReportStatus.ASSIGNED);
        
        return assignment;
    }

    @Transactional
    public Assignment acceptAssignment(Long assignmentId, String workerEmail) {
        Assignment assignment = assignmentRepository.findById(assignmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Assignment not found"));
        
        if (!assignment.getWorker().getEmail().equals(workerEmail)) {
            throw new UnauthorizedException("Not your assignment");
        }

        assignment.setStatus(AssignmentStatus.ACCEPTED);
        assignment.setAcceptedAt(LocalDateTime.now());
        assignment = assignmentRepository.save(assignment);

        Report report = assignment.getReport();
        report.setStatus(ReportStatus.IN_PROGRESS);
        reportRepository.save(report);

        notificationService.notifyStatusChange(report, ReportStatus.IN_PROGRESS);
        return assignment;
    }

    @Transactional
    public Assignment rejectAssignment(Long assignmentId, String reason, String workerEmail) {
        Assignment assignment = assignmentRepository.findById(assignmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Assignment not found"));
                
        if (!assignment.getWorker().getEmail().equals(workerEmail)) {
            throw new UnauthorizedException("Not your assignment");
        }

        assignment.setStatus(AssignmentStatus.REJECTED);
        assignment.setRejectionReason(reason);
        assignment = assignmentRepository.save(assignment);

        Report report = assignment.getReport();
        report.setStatus(ReportStatus.VERIFIED);
        reportRepository.save(report);

        // Notify admin in a real app, skipping explicit method here since we notify by report
        return assignment;
    }

    public List<Assignment> getWorkerAssignments(String workerEmail) {
        User worker = userRepository.findByEmail(workerEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Worker not found"));
        return assignmentRepository.findByWorker(worker);
    }

    @Transactional
    public ReportResponse resolveReport(Long reportId, MultipartFile proofPhoto, String workerEmail) {
        User worker = userRepository.findByEmail(workerEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Worker not found"));
        Report report = reportRepository.findById(reportId)
                .orElseThrow(() -> new ResourceNotFoundException("Report not found"));

        Assignment assignment = assignmentRepository.findByReportAndWorker(report, worker)
                .orElseThrow(() -> new UnauthorizedException("You are not assigned to this report"));

        if (assignment.getStatus() != AssignmentStatus.ACCEPTED) {
            throw new IllegalStateException("You must accept the assignment before resolving");
        }

        if (proofPhoto != null && !proofPhoto.isEmpty()) {
            reportService.uploadAttachment(reportId, proofPhoto, workerEmail, true);
        }

        assignment.setStatus(AssignmentStatus.COMPLETED);
        assignment.setCompletedAt(LocalDateTime.now());
        assignmentRepository.save(assignment);

        report.setStatus(ReportStatus.CITIZEN_VERIFICATION);
        report.setResolvedAt(LocalDateTime.now());
        reportRepository.save(report);

        notificationService.notifyStatusChange(report, ReportStatus.RESOLVED);
        
        return reportService.getReportById(reportId);
    }
}
