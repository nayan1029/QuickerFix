package com.quickerfix.service;

import com.quickerfix.dto.response.AnalyticsResponse;
import com.quickerfix.enums.ReportStatus;
import com.quickerfix.exception.ResourceNotFoundException;
import com.quickerfix.repository.CategoryRepository;
import com.quickerfix.repository.ReportRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service @RequiredArgsConstructor
public class AnalyticsService {
    private static final int RESOLUTION_SAMPLE_CAP = 1000;
    private final ReportRepository reports;
    private final CategoryRepository categories;

    @Transactional(readOnly=true)
    public AnalyticsResponse get(LocalDate fromDate, LocalDate toDate, Long categoryId) {
        LocalDate to = toDate == null ? LocalDate.now() : toDate;
        LocalDate from = fromDate == null ? to.minusDays(89) : fromDate;
        if (from.isAfter(to)) throw new IllegalArgumentException("Start date must not be after end date");
        if (from.plusDays(365).isBefore(to)) throw new IllegalArgumentException("Analytics date range cannot exceed 366 days");
        if (categoryId != null && !categories.existsById(categoryId)) throw new ResourceNotFoundException("Category not found");
        LocalDateTime start = from.atStartOfDay(), end = to.plusDays(1).atStartOfDay(), now = LocalDateTime.now();
        Map<String,Long> statuses = reports.aggregateStatuses(start,end,categoryId).stream().collect(Collectors.toMap(row -> ((ReportStatus)row[0]).name(), row -> ((Number)row[1]).longValue()));
        for (ReportStatus status : ReportStatus.values()) statuses.putIfAbsent(status.name(),0L);
        Map<String,Long> byCategory = new LinkedHashMap<>();
        reports.aggregateCategories(start,end,categoryId).stream().sorted(Comparator.comparingLong((Object[] row)->((Number)row[1]).longValue()).reversed())
                .forEach(row->byCategory.put((String)row[0],((Number)row[1]).longValue()));
        Map<String,Long> age = new LinkedHashMap<>();
        age.put("0-1 days",reports.countBacklogAge(ReportStatus.CLOSED,start,end,categoryId,now.minusDays(1),now.plusSeconds(1)));
        age.put("2-7 days",reports.countBacklogAge(ReportStatus.CLOSED,start,end,categoryId,now.minusDays(7),now.minusDays(1)));
        age.put("8-30 days",reports.countBacklogAge(ReportStatus.CLOSED,start,end,categoryId,now.minusDays(30),now.minusDays(7)));
        age.put("30+ days",reports.countBacklogAge(ReportStatus.CLOSED,start,end,categoryId,now.minusDays(36500),now.minusDays(30)));
        Page<Object[]> resolved = reports.recentResolutionTimes(ReportStatus.CLOSED,start,end,categoryId,PageRequest.of(0,RESOLUTION_SAMPLE_CAP));
        List<Double> hours = resolved.getContent().stream().map(row->Duration.between((LocalDateTime)row[0],(LocalDateTime)row[1]).toSeconds()/3600.0).filter(h->h>=0).sorted().toList();
        long total = statuses.values().stream().mapToLong(Long::longValue).sum();
        return new AnalyticsResponse(from,to,categoryId,total,statuses.getOrDefault(ReportStatus.CLOSED.name(),0L),total<20,statuses,byCategory,age,
                percentile(hours,0.5),percentile(hours,0.9),hours.size(),resolved.getTotalElements()>RESOLUTION_SAMPLE_CAP);
    }
    private Double percentile(List<Double> values,double p) {
        if(values.isEmpty()) return null;
        int index=(int)Math.ceil(p*values.size())-1; return Math.round(values.get(Math.max(0,index))*10.0)/10.0;
    }
}
