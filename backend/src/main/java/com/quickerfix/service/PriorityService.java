package com.quickerfix.service;

import com.quickerfix.entity.Report;
import com.quickerfix.enums.ReportStatus;
import com.quickerfix.repository.ReportRepository;
import com.quickerfix.util.PriorityCalculator;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;
import java.util.Arrays;

@Service
@RequiredArgsConstructor
public class PriorityService {

    private final ReportRepository reportRepository;
    private final PriorityCalculator priorityCalculator;

    public void recalculatePriority(Report report) {
        if (report.getStatus() == ReportStatus.CLOSED) {
            return;
        }
        int score = priorityCalculator.calculate(report);
        report.setPriorityScore(score);
        reportRepository.save(report);
    }

    @Scheduled(cron = "0 0 * * * *")
    public void recalculateAllOpenReports() {
        List<ReportStatus> openStatuses = Arrays.asList(
            ReportStatus.REPORTED, 
            ReportStatus.UNDER_REVIEW, 
            ReportStatus.VERIFIED, 
            ReportStatus.ASSIGNED, 
            ReportStatus.IN_PROGRESS, 
            ReportStatus.REOPENED
        );
        
        List<Report> openReports = reportRepository.findByStatusIn(openStatuses);
        
        for (Report report : openReports) {
            int score = priorityCalculator.calculate(report);
            report.setPriorityScore(score);
        }
        
        reportRepository.saveAll(openReports);
    }
}
