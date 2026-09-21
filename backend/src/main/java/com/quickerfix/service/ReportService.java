package com.quickerfix.service;

import com.quickerfix.dto.request.CommentRequest;
import com.quickerfix.dto.request.RatingRequest;
import com.quickerfix.dto.request.RejectResolutionRequest;
import com.quickerfix.dto.request.ReportRequest;
import com.quickerfix.dto.request.StatusUpdateRequest;
import com.quickerfix.dto.response.ReportResponse;
import com.quickerfix.entity.*;
import com.quickerfix.enums.ReportStatus;
import com.quickerfix.exception.DuplicateReportException;
import com.quickerfix.exception.InvalidStatusTransitionException;
import com.quickerfix.exception.ResourceNotFoundException;
import com.quickerfix.exception.UnauthorizedException;
import com.quickerfix.repository.*;
import com.quickerfix.util.LocationUtils;
import com.quickerfix.util.PriorityCalculator;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReportService {

    private final ReportRepository reportRepository;
    private final CategoryRepository categoryRepository;
    private final UserRepository userRepository;
    private final AttachmentRepository attachmentRepository;
    private final StatusHistoryRepository statusHistoryRepository;
    private final CommentRepository commentRepository;
    private final RatingRepository ratingRepository;
    private final NotificationService notificationService;
    private final PriorityService priorityService;
    private final LocationUtils locationUtils;
    private final PriorityCalculator priorityCalculator;
    private final FileStorageService fileStorageService;

    @Transactional
    public ReportResponse createReport(ReportRequest request, List<MultipartFile> photos, String citizenEmail) {
        User citizen = userRepository.findByEmail(citizenEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Citizen not found"));
        
        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category not found"));

        if (request.getLatitude() != null && request.getLongitude() != null) {
            List<Report> nearbyOpenReports = getNearbyOpenReports(request.getLatitude(), request.getLongitude(), 100.0)
                    .stream()
                    .filter(r -> r.getCategory().getId().equals(category.getId()))
                    .collect(Collectors.toList());

            if (!nearbyOpenReports.isEmpty()) {
                Report original = nearbyOpenReports.get(0);
                original.setDuplicateCount(original.getDuplicateCount() + 1);
                priorityService.recalculatePriority(original);
                original = reportRepository.save(original);

                if (photos != null && !photos.isEmpty()) {
                    for (MultipartFile photo : photos) {
                        uploadAttachment(original.getId(), photo, citizenEmail, false);
                    }
                }

                return mapToResponse(original);
            }
        }

        Report report = buildReport(request, citizen, category);
        report = reportRepository.save(report);

        if (photos != null && !photos.isEmpty()) {
            for (MultipartFile photo : photos) {
                uploadAttachment(report.getId(), photo, citizenEmail, false);
            }
        }

        report.setPriorityScore(priorityCalculator.calculate(report));
        report = reportRepository.save(report);

        StatusHistory history = new StatusHistory();
        history.setReport(report);
        history.setNewStatus(ReportStatus.REPORTED);
        history.setChangedBy(citizen);
        history.setChangedAt(LocalDateTime.now());
        statusHistoryRepository.save(history);

        return mapToResponse(report);
    }

    public ReportResponse getReportById(Long id) {
        return mapToResponse(reportRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Report not found")));
    }

    public Page<ReportResponse> getAllReports(int page, int size) {
        return reportRepository.findAll(PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "priorityScore")))
                .map(this::mapToResponse);
    }

    public List<ReportResponse> getCitizenReports(String citizenEmail) {
        User citizen = userRepository.findByEmail(citizenEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Citizen not found"));
        return reportRepository.findByCitizen(citizen).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public List<ReportResponse> getNearbyReports(Double lat, Double lng, Double radiusMeters) {
        return getNearbyOpenReports(lat, lng, radiusMeters).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }
    
    private List<Report> getNearbyOpenReports(Double lat, Double lng, Double radiusMeters) {
        List<ReportStatus> openStatuses = Arrays.asList(ReportStatus.REPORTED, ReportStatus.UNDER_REVIEW, 
            ReportStatus.VERIFIED, ReportStatus.ASSIGNED, ReportStatus.IN_PROGRESS,
            ReportStatus.RESOLVED, ReportStatus.CITIZEN_VERIFICATION, ReportStatus.REOPENED);
        List<Report> openReports = reportRepository.findByStatusIn(openStatuses);
        List<Report> nearby = new ArrayList<>();
        
        for (Report r : openReports) {
            if (r.getLatitude() != null && r.getLongitude() != null) {
                double distance = locationUtils.calculateDistance(lat, lng, r.getLatitude(), r.getLongitude());
                if (distance <= radiusMeters) {
                    nearby.add(r);
                }
            }
        }
        return nearby;
    }

    @Transactional
    public ReportResponse upvoteReport(Long reportId, String citizenEmail) {
        Report report = reportRepository.findById(reportId)
                .orElseThrow(() -> new ResourceNotFoundException("Report not found"));
        
        report.setUpvoteCount(report.getUpvoteCount() + 1);
        priorityService.recalculatePriority(report);
        return mapToResponse(reportRepository.save(report));
    }

    @Transactional
    public ReportResponse updateStatus(Long reportId, StatusUpdateRequest request, String userEmail) {
        Report report = reportRepository.findById(reportId)
                .orElseThrow(() -> new ResourceNotFoundException("Report not found"));
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (!report.getStatus().canTransitionTo(request.getNewStatus())) {
            throw new InvalidStatusTransitionException("Cannot transition from " + report.getStatus() + " to " + request.getNewStatus());
        }

        ReportStatus oldStatus = report.getStatus();
        report.setStatus(request.getNewStatus());
        report.setUpdatedAt(LocalDateTime.now());
        
        if (request.getNewStatus() == ReportStatus.RESOLVED) {
            report.setResolvedAt(LocalDateTime.now());
            report.setStatus(ReportStatus.CITIZEN_VERIFICATION);
        } else if (request.getNewStatus() == ReportStatus.CLOSED) {
            report.setClosedAt(LocalDateTime.now());
        }

        report = reportRepository.save(report);

        StatusHistory history = new StatusHistory();
        history.setReport(report);
        history.setOldStatus(oldStatus);
        history.setNewStatus(report.getStatus());
        history.setChangedBy(user);
        history.setRemark(request.getRemark());
        history.setChangedAt(LocalDateTime.now());
        statusHistoryRepository.save(history);

        notificationService.notifyStatusChange(report, report.getStatus());

        return mapToResponse(report);
    }

    @Transactional
    public ReportResponse confirmResolution(Long reportId, String citizenEmail) {
        Report report = reportRepository.findById(reportId)
                .orElseThrow(() -> new ResourceNotFoundException("Report not found"));
        if (!report.getCitizen().getEmail().equals(citizenEmail)) {
            throw new UnauthorizedException("Not the owner");
        }
        if (report.getStatus() != ReportStatus.CITIZEN_VERIFICATION) {
            throw new InvalidStatusTransitionException("Report not awaiting verification");
        }
        
        report.setStatus(ReportStatus.CLOSED);
        report.setClosedAt(LocalDateTime.now());
        report = reportRepository.save(report);
        
        notificationService.notifyStatusChange(report, ReportStatus.CLOSED);
        return mapToResponse(report);
    }

    @Transactional
    public ReportResponse rejectResolution(Long reportId, RejectResolutionRequest request, String citizenEmail) {
        Report report = reportRepository.findById(reportId)
                .orElseThrow(() -> new ResourceNotFoundException("Report not found"));
        if (!report.getCitizen().getEmail().equals(citizenEmail)) {
            throw new UnauthorizedException("Not the owner");
        }
        if (report.getStatus() != ReportStatus.CITIZEN_VERIFICATION) {
            throw new InvalidStatusTransitionException("Report not awaiting verification");
        }

        report.setStatus(ReportStatus.REOPENED);
        report.setUpdatedAt(LocalDateTime.now());
        report = reportRepository.save(report);

        notificationService.notifyStatusChange(report, ReportStatus.REOPENED);
        
        return mapToResponse(report);
    }

    @Transactional
    public Comment addComment(Long reportId, CommentRequest request, String userEmail) {
        Report report = reportRepository.findById(reportId)
                .orElseThrow(() -> new ResourceNotFoundException("Report not found"));
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
                
        Comment comment = new Comment();
        comment.setReport(report);
        comment.setAuthor(user);
        comment.setContent(request.getContent());
        comment.setCreatedAt(LocalDateTime.now());
        
        return commentRepository.save(comment);
    }

    public List<Comment> getComments(Long reportId) {
        Report report = reportRepository.findById(reportId)
                .orElseThrow(() -> new ResourceNotFoundException("Report not found"));
        return commentRepository.findByReportOrderByCreatedAtAsc(report);
    }

    @Transactional
    public Attachment uploadAttachment(Long reportId, MultipartFile file, String userEmail, boolean isProof) {
        Report report = reportRepository.findById(reportId)
                .orElseThrow(() -> new ResourceNotFoundException("Report not found"));
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        String fileUrl = fileStorageService.storeFile(file, "reports/" + reportId);
        
        Attachment attachment = new Attachment();
        attachment.setReport(report);
        attachment.setUploadedBy(user);
        attachment.setFileName(file.getOriginalFilename());
        attachment.setFileUrl(fileUrl);
        attachment.setFileType(file.getContentType());
        attachment.setFileSize(file.getSize());
        attachment.setResolutionProof(isProof);
        attachment.setUploadedAt(LocalDateTime.now());
        
        return attachmentRepository.save(attachment);
    }

    @Transactional
    public Rating rateReport(Long reportId, RatingRequest request, String citizenEmail) {
        Report report = reportRepository.findById(reportId)
                .orElseThrow(() -> new ResourceNotFoundException("Report not found"));
        User citizen = userRepository.findByEmail(citizenEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Citizen not found"));
                
        if (!report.getCitizen().getId().equals(citizen.getId())) {
            throw new UnauthorizedException("Only the creator can rate this report");
        }
        if (report.getStatus() != ReportStatus.CLOSED) {
            throw new IllegalStateException("Report must be closed before rating");
        }
        if (ratingRepository.existsByReportId(report.getId())) {
            throw new IllegalStateException("Report already rated");
        }
        
        Rating rating = new Rating();
        rating.setReport(report);
        rating.setCitizen(citizen);
        rating.setScore(request.getScore());
        rating.setComment(request.getComment());
        rating.setCreatedAt(LocalDateTime.now());
        
        return ratingRepository.save(rating);
    }

    private Report buildReport(ReportRequest request, User citizen, Category category) {
        Report report = new Report();
        report.setTitle(request.getTitle());
        report.setDescription(request.getDescription());
        report.setCategory(category);
        report.setCitizen(citizen);
        report.setLatitude(request.getLatitude());
        report.setLongitude(request.getLongitude());
        report.setAddress(request.getAddress());
        report.setSeverity(request.getSeverity());
        report.setStatus(ReportStatus.REPORTED);
        report.setUpvoteCount(0);
        report.setDuplicateCount(0);
        report.setMarkedAsDuplicate(false);
        report.setCreatedAt(LocalDateTime.now());
        report.setUpdatedAt(LocalDateTime.now());
        return report;
    }

    private ReportResponse mapToResponse(Report report) {
        ReportResponse r = new ReportResponse();
        r.setId(report.getId());
        r.setTitle(report.getTitle());
        r.setDescription(report.getDescription());
        r.setCategoryName(report.getCategory().getName());
        r.setCitizenName(report.getCitizen().getName());
        r.setLatitude(report.getLatitude());
        r.setLongitude(report.getLongitude());
        r.setAddress(report.getAddress());
        r.setSeverity(report.getSeverity());
        r.setStatus(report.getStatus());
        r.setPriorityScore(report.getPriorityScore());
        r.setUpvoteCount(report.getUpvoteCount());
        r.setDuplicateCount(report.getDuplicateCount());
        r.setMarkedAsDuplicate(report.isMarkedAsDuplicate());
        r.setDuplicateOfReportId(report.getDuplicateOfReportId());
        r.setCreatedAt(report.getCreatedAt());
        r.setUpdatedAt(report.getUpdatedAt());
        r.setResolvedAt(report.getResolvedAt());
        r.setClosedAt(report.getClosedAt());
        return r;
    }
}
