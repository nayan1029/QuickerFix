package com.quickerfix.service;

import com.quickerfix.dto.request.TriageReviewRequest;
import com.quickerfix.dto.response.TriageSuggestionResponse;
import com.quickerfix.entity.*;
import com.quickerfix.enums.ReportStatus;
import com.quickerfix.exception.ResourceNotFoundException;
import com.quickerfix.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@Service @RequiredArgsConstructor
public class TriageService {
    private final ReportRepository reports;
    private final CategoryRepository categories;
    private final UserRepository users;
    private final TriageDecisionRepository decisions;
    private final TriageProvider provider;
    private final Map<String, ArrayDeque<Long>> requests = new ConcurrentHashMap<>();

    @Transactional(readOnly = true)
    public TriageSuggestionResponse suggest(Long reportId, String email) {
        throttle(email);
        Report report = reports.findById(reportId).orElseThrow(() -> new ResourceNotFoundException("Report not found"));
        if (report.getStatus() != ReportStatus.REPORTED && report.getStatus() != ReportStatus.UNDER_REVIEW)
            throw new IllegalArgumentException("Triage is only available for new reports under review");
        List<Category> available = categories.findByActive(true);
        if (available.isEmpty()) throw new IllegalStateException("No active categories are available");
        TriageProvider.Result result;
        try { result = provider.classify(report.getTitle(), report.getDescription(), available); }
        catch (RuntimeException ex) { result = new TriageProvider.Result(report.getCategory().getId(), 0.0, "Classifier unavailable; please review category and severity manually.", "FALLBACK", report.getSeverity(), List.of()); }
        TriageProvider.Result suggestion = result;
        Category selected = available.stream().filter(c -> c.getId().equals(suggestion.categoryId())).findFirst().orElse(available.get(0));
        double confidence = Math.max(0, Math.min(1, result.confidence()));
        List<TriageSuggestionResponse.Alternative> alternatives = result.alternatives().stream()
                .map(c -> new TriageSuggestionResponse.Alternative(c.categoryId(), c.categoryName(), c.confidence())).toList();
        Department department = selected.getDepartment();
        return new TriageSuggestionResponse(reportId, selected.getId(), selected.getName(), department == null ? null : department.getId(),
                department == null ? null : department.getName(), result.severity(), confidence, result.rationale(), result.source(),
                confidence < 0.45 || "FALLBACK".equals(result.source()), alternatives);
    }

    @Transactional
    public void review(Long reportId, TriageReviewRequest request, String email) {
        Report report = reports.findById(reportId).orElseThrow(() -> new ResourceNotFoundException("Report not found"));
        if (report.getStatus() != ReportStatus.REPORTED && report.getStatus() != ReportStatus.UNDER_REVIEW)
            throw new IllegalArgumentException("Only new reports under review can be triaged");
        Category chosen = categories.findById(request.getCategoryId()).filter(Category::isActive)
                .orElseThrow(() -> new ResourceNotFoundException("Active category not found"));
        TriageSuggestionResponse suggestion = suggest(reportId, email);
        User reviewer = users.findByEmail(email).orElseThrow(() -> new ResourceNotFoundException("Reviewer not found"));
        TriageDecision decision = new TriageDecision(); decision.setReport(report); decision.setReviewer(reviewer);
        decision.setSuggestedCategoryId(suggestion.getCategoryId()); decision.setSuggestedCategoryName(suggestion.getCategoryName());
        decision.setSuggestedSeverity(suggestion.getSeverity()); decision.setConfidence(suggestion.getConfidence()); decision.setSource(suggestion.getSource());
        decision.setChosenCategoryId(chosen.getId()); decision.setChosenSeverity(request.getSeverity());
        decision.setNote(request.getNote() == null ? null : request.getNote().trim()); decisions.save(decision);
        report.setCategory(chosen); report.setSeverity(request.getSeverity()); reports.save(report);
    }

    private void throttle(String email) {
        long now = System.currentTimeMillis();
        ArrayDeque<Long> bucket = requests.computeIfAbsent(email, key -> new ArrayDeque<>());
        synchronized (bucket) {
            while (!bucket.isEmpty() && now - bucket.peekFirst() > 60_000) bucket.removeFirst();
            if (bucket.size() >= 30) throw new IllegalArgumentException("Triage limit reached; wait one minute and try again");
            bucket.addLast(now);
        }
    }
}
