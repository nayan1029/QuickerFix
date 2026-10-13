package com.quickerfix.service;

import com.quickerfix.dto.response.DuplicateCandidateResponse;
import com.quickerfix.entity.*;
import com.quickerfix.enums.ReportStatus;
import com.quickerfix.exception.ResourceNotFoundException;
import com.quickerfix.repository.*;
import com.quickerfix.util.LocationUtils;
import com.quickerfix.util.PriorityCalculator;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.text.Normalizer;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service @RequiredArgsConstructor
public class DuplicateService {
    private static final List<ReportStatus> OPEN = List.of(ReportStatus.REPORTED, ReportStatus.UNDER_REVIEW, ReportStatus.VERIFIED,
            ReportStatus.ASSIGNED, ReportStatus.IN_PROGRESS, ReportStatus.RESOLVED, ReportStatus.CITIZEN_VERIFICATION, ReportStatus.REOPENED);
    private final ReportRepository reports;
    private final DuplicateLinkRepository links;
    private final UserRepository users;
    private final LocationUtils locations;
    private final PriorityCalculator priorities;
    private final PriorityService priorityService;
    @Value("${app.duplicates.window-days:30}") private int windowDays;
    @Value("${app.duplicates.radius-meters:500}") private double radiusMeters;

    @Transactional(readOnly = true)
    public List<DuplicateCandidateResponse> candidates(Long reportId) {
        Report source = reports.findById(reportId).orElseThrow(() -> new ResourceNotFoundException("Report not found"));
        if (source.getLatitude() == null || source.getLongitude() == null) return List.of();
        LocalDateTime cutoff = LocalDateTime.now().minusDays(Math.max(1, Math.min(365, windowDays)));
        List<Report> possible = reports.findByCategoryIdAndStatusInAndMarkedAsDuplicateFalseAndCreatedAtAfter(
                source.getCategory().getId(), OPEN, cutoff, PageRequest.of(0, 200));
        return possible.stream().filter(r -> !r.getId().equals(source.getId()) && r.getLatitude() != null && r.getLongitude() != null)
                .map(r -> candidate(source, r)).filter(Objects::nonNull)
                .sorted(Comparator.comparingDouble(DuplicateCandidateResponse::getSimilarity).reversed()
                        .thenComparingDouble(DuplicateCandidateResponse::getDistanceMeters))
                .limit(10).toList();
    }

    @Transactional
    public void link(Long reportId, Long canonicalId, String adminEmail, String note) {
        if (reportId.equals(canonicalId)) throw new IllegalArgumentException("A report cannot be a duplicate of itself");
        Report report = reports.findById(reportId).orElseThrow(() -> new ResourceNotFoundException("Report not found"));
        Report canonical = reports.findById(canonicalId).orElseThrow(() -> new ResourceNotFoundException("Candidate report not found"));
        if (report.isMarkedAsDuplicate()) throw new IllegalArgumentException("This report is already linked as a duplicate");
        if (canonical.isMarkedAsDuplicate()) throw new IllegalArgumentException("Choose the original report rather than another duplicate");
        if (!report.getCategory().getId().equals(canonical.getCategory().getId())) throw new IllegalArgumentException("Reports must have the same category");
        DuplicateCandidateResponse candidate = candidate(report, canonical);
        if (candidate == null) throw new IllegalArgumentException("Reports must be within the configured duplicate window and location radius");
        User admin = users.findByEmail(adminEmail).orElseThrow(() -> new ResourceNotFoundException("Administrator not found"));
        DuplicateLink link = new DuplicateLink(); link.setReport(report); link.setCanonicalReport(canonical); link.setLinkedBy(admin);
        link.setNote(note == null ? null : note.trim()); links.save(link);
        report.setMarkedAsDuplicate(true); report.setDuplicateOfReportId(canonical.getId()); reports.save(report);
        canonical.setDuplicateCount(canonical.getDuplicateCount() + 1); canonical.setPriorityScore(priorities.calculate(canonical));
        priorityService.recalculatePriority(canonical); reports.save(canonical);
    }

    private DuplicateCandidateResponse candidate(Report source, Report possible) {
        double distance = locations.calculateDistance(source.getLatitude(), source.getLongitude(), possible.getLatitude(), possible.getLongitude());
        if (distance > radiusMeters || possible.getCreatedAt().isBefore(LocalDateTime.now().minusDays(Math.max(1, Math.min(365, windowDays))))) return null;
        Set<String> left = words(source.getTitle() + " " + source.getDescription());
        Set<String> right = words(possible.getTitle() + " " + possible.getDescription());
        Set<String> intersection = new HashSet<>(left); intersection.retainAll(right);
        Set<String> union = new HashSet<>(left); union.addAll(right);
        double similarity = union.isEmpty() ? 0 : (double) intersection.size() / union.size();
        if (similarity < 0.08) return null;
        String reason = "Same category; " + Math.round(distance) + " m apart; " + Math.round(similarity * 100) + "% title/description token overlap";
        return new DuplicateCandidateResponse(possible.getId(), possible.getTitle(), possible.getCategory().getName(), possible.getStatus(), distance, similarity, reason, possible.getCreatedAt());
    }
    private Set<String> words(String text) {
        String normalized = Normalizer.normalize(text == null ? "" : text, Normalizer.Form.NFD).replaceAll("\\p{M}", "").toLowerCase(Locale.ROOT);
        return Arrays.stream(normalized.replaceAll("[^a-z0-9 ]", " ").split("\\s+"))
                .filter(s -> s.length() > 2).collect(Collectors.toSet());
    }
}
