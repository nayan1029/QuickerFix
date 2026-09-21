package com.quickerfix.service;

import com.quickerfix.dto.response.DashboardResponse;
import com.quickerfix.dto.response.ReportResponse;
import com.quickerfix.dto.response.UserResponse;
import com.quickerfix.entity.Category;
import com.quickerfix.entity.Department;
import com.quickerfix.entity.Report;
import com.quickerfix.entity.User;
import com.quickerfix.enums.ReportStatus;
import com.quickerfix.exception.ResourceNotFoundException;
import com.quickerfix.repository.CategoryRepository;
import com.quickerfix.repository.DepartmentRepository;
import com.quickerfix.repository.ReportRepository;
import com.quickerfix.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdminService {

    private final ReportRepository reportRepository;
    private final UserRepository userRepository;
    private final CategoryRepository categoryRepository;
    private final DepartmentRepository departmentRepository;

    public DashboardResponse getDashboard() {
        DashboardResponse response = new DashboardResponse();
        
        long totalReports = reportRepository.count();
        long closedReports = reportRepository.countByStatus(ReportStatus.CLOSED);
        long inProgressReports = reportRepository.countByStatus(ReportStatus.IN_PROGRESS);
        long newReports = reportRepository.countByStatus(ReportStatus.REPORTED);
        
        double resolutionRate = totalReports == 0 ? 0 : ((double) closedReports / totalReports) * 100.0;
        
        Map<String, Long> statusCounts = new HashMap<>();
        for (ReportStatus status : ReportStatus.values()) {
            statusCounts.put(status.name(), reportRepository.countByStatus(status));
        }

        Map<String, Long> categoryCounts = new HashMap<>();
        List<Category> categories = categoryRepository.findAll();
        for (Category cat : categories) {
            categoryCounts.put(cat.getName(), reportRepository.countByCategory(cat));
        }

        response.setTotalReports(totalReports);
        response.setClosedReports(closedReports);
        response.setInProgressReports(inProgressReports);
        response.setPendingReports(newReports);
        response.setResolutionRate(resolutionRate);
        response.setReportsByCategory(categoryCounts);
        response.setHighPriorityReports(getPriorityQueue().stream().limit(10).collect(Collectors.toList()));
        
        return response;
    }

    public List<ReportResponse> getPriorityQueue() {
        return reportRepository.findAllByStatusNotOrderByPriorityScoreDesc(ReportStatus.CLOSED)
                .stream()
                .map(this::mapToReportResponse)
                .collect(Collectors.toList());
    }

    public List<UserResponse> getAllUsers() {
        return userRepository.findAll().stream()
                .map(this::mapToUserResponse)
                .collect(Collectors.toList());
    }

    public UserResponse getUserById(Long id) {
        return mapToUserResponse(userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found")));
    }

    public void toggleUserEnabled(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        user.setEnabled(!user.isEnabled());
        userRepository.save(user);
    }

    public List<ReportResponse> getReportsByStatus(ReportStatus status) {
        return reportRepository.findByStatus(status).stream()
                .map(this::mapToReportResponse)
                .collect(Collectors.toList());
    }

    public void deleteReport(Long reportId) {
        Report report = reportRepository.findById(reportId)
                .orElseThrow(() -> new ResourceNotFoundException("Report not found"));
        reportRepository.delete(report);
    }

    public Category createCategory(String name, String description, String icon, Long departmentId) {
        Department dept = departmentRepository.findById(departmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Department not found"));
        Category category = new Category();
        category.setName(name);
        category.setDescription(description);
        category.setIcon(icon);
        category.setDepartment(dept);
        return categoryRepository.save(category);
    }

    public Department createDepartment(String name, String description, String contactEmail) {
        Department dept = new Department();
        dept.setName(name);
        dept.setDescription(description);
        dept.setContactEmail(contactEmail);
        return departmentRepository.save(dept);
    }

    private UserResponse mapToUserResponse(User user) {
        UserResponse r = new UserResponse();
        r.setId(user.getId());
        r.setName(user.getName());
        r.setEmail(user.getEmail());
        r.setPhone(user.getPhone());
        r.setRole(user.getRole());
        r.setEnabled(user.isEnabled());
        if (user.getDepartment() != null) {
            r.setDepartmentId(user.getDepartment().getId());
            r.setDepartmentName(user.getDepartment().getName());
        }
        return r;
    }
    
    private ReportResponse mapToReportResponse(Report report) {
        ReportResponse r = new ReportResponse();
        r.setId(report.getId());
        r.setTitle(report.getTitle());
        r.setStatus(report.getStatus());
        r.setPriorityScore(report.getPriorityScore());
        r.setCategoryName(report.getCategory().getName());
        r.setCitizenName(report.getCitizen().getName());
        r.setSeverity(report.getSeverity());
        return r;
    }
}
