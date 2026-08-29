package com.quickerfix.util;

import com.quickerfix.entity.Report;
import com.quickerfix.enums.Severity;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;

@Component
public class PriorityCalculator {

    public int calculate(Report report) {
        // Severity score: LOW=5, MEDIUM=15, HIGH=25, CRITICAL=30
        int severityScore = getSeverityScore(report.getSeverity());
        
        // Upvote score: min(upvoteCount * 0.5, 15) — capped at 15
        int upvoteScore = (int) Math.min(report.getUpvoteCount() * 0.5, 15);
        
        // Age score: older unresolved = higher priority, max 20
        long daysOld = 0;
        if (report.getCreatedAt() != null) {
            daysOld = ChronoUnit.DAYS.between(report.getCreatedAt(), LocalDateTime.now());
        }
        int ageScore = (int) Math.min(daysOld * 2, 20);
        
        // Duplicate score: more people reporting = higher priority, max 25
        int duplicateScore = (int) Math.min(report.getDuplicateCount() * 2.5, 25);
        
        // Location importance: default 5 (could be extended later)
        int locationScore = 5;
        
        return Math.min(severityScore + upvoteScore + ageScore + duplicateScore + locationScore, 100);
    }
    
    private int getSeverityScore(Severity severity) {
        if (severity == null) {
            return 5;
        }
        switch (severity) {
            case CRITICAL:
                return 30;
            case HIGH:
                return 25;
            case MEDIUM:
                return 15;
            case LOW:
            default:
                return 5;
        }
    }
}
