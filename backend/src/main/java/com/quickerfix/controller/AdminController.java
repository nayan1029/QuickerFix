package com.quickerfix.controller;

import com.quickerfix.dto.request.AssignRequest;
import com.quickerfix.dto.request.CreateWorkerRequest;
import com.quickerfix.dto.request.TriageReviewRequest;
import com.quickerfix.dto.response.ApiResponse;
import com.quickerfix.dto.response.AssignmentResponse;
import com.quickerfix.dto.response.CategoryResponse;
import com.quickerfix.dto.response.DashboardResponse;
import com.quickerfix.dto.response.ReportResponse;
import com.quickerfix.dto.response.UserResponse;
import com.quickerfix.dto.response.TriageSuggestionResponse;
import com.quickerfix.dto.response.DuplicateCandidateResponse;
import com.quickerfix.dto.response.AnalyticsResponse;
import com.quickerfix.entity.Assignment;
import com.quickerfix.entity.Category;
import com.quickerfix.entity.Department;
import com.quickerfix.enums.ReportStatus;
import com.quickerfix.service.AdminService;
import com.quickerfix.service.AssignmentService;
import com.quickerfix.service.TriageService;
import com.quickerfix.service.DuplicateService;
import com.quickerfix.service.AnalyticsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.time.LocalDate;
import org.springframework.format.annotation.DateTimeFormat;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
public class AdminController {

    private final AdminService adminService;
    private final AssignmentService assignmentService;
    private final TriageService triageService;
    private final DuplicateService duplicateService;
    private final AnalyticsService analyticsService;

    @GetMapping("/dashboard")
    public ResponseEntity<ApiResponse<DashboardResponse>> getDashboard() {
        return ResponseEntity.ok(new ApiResponse<>(true, "Dashboard fetched", adminService.getDashboard()));
    }

    @GetMapping("/analytics")
    public ResponseEntity<ApiResponse<AnalyticsResponse>> getAnalytics(
            @RequestParam(required=false) @DateTimeFormat(iso=DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required=false) @DateTimeFormat(iso=DateTimeFormat.ISO.DATE) LocalDate to,
            @RequestParam(required=false) Long categoryId) {
        return ResponseEntity.ok(ApiResponse.success("Analytics fetched",analyticsService.get(from,to,categoryId)));
    }

    @GetMapping("/reports")
    public ResponseEntity<ApiResponse<Page<ReportResponse>>> getReportsByStatus(
            @RequestParam(required = false) ReportStatus status,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) String query,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "false") boolean includeClosed) {
        Page<ReportResponse> reports = adminService.getPriorityQueue(Math.max(0, page), Math.max(1, Math.min(50, size)),
                status, categoryId, query, includeClosed);
        return ResponseEntity.ok(new ApiResponse<>(true, "Reports fetched", reports));
    }

    @GetMapping("/reports/priority")
    public ResponseEntity<ApiResponse<Page<ReportResponse>>> getPriorityQueue(
            @RequestParam(required = false) ReportStatus status,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) String query,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "false") boolean includeClosed) {
        Page<ReportResponse> reports = adminService.getPriorityQueue(Math.max(0, page), Math.max(1, Math.min(50, size)),
                status, categoryId, query, includeClosed);
        return ResponseEntity.ok(new ApiResponse<>(true, "Priority queue fetched", reports));
    }

    @DeleteMapping("/reports/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteReport(@PathVariable Long id) {
        adminService.deleteReport(id);
        return ResponseEntity.ok(new ApiResponse<>(true, "Report deleted successfully", null));
    }

    @PostMapping("/reports/{id}/assign")
    public ResponseEntity<ApiResponse<AssignmentResponse>> assignWorker(@PathVariable Long id, @RequestBody AssignRequest request) {
        String adminEmail = SecurityContextHolder.getContext().getAuthentication().getName();
        Assignment assignment = assignmentService.assignWorker(id, request, adminEmail);
        return ResponseEntity.ok(new ApiResponse<>(true, "Worker assigned successfully", assignmentService.toResponse(assignment)));
    }

    @GetMapping("/reports/{id}/triage")
    public ResponseEntity<ApiResponse<TriageSuggestionResponse>> suggestTriage(@PathVariable Long id) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return ResponseEntity.ok(new ApiResponse<>(true, "Triage suggestion generated", triageService.suggest(id, email)));
    }

    @PostMapping("/reports/{id}/triage/review")
    public ResponseEntity<ApiResponse<Void>> reviewTriage(@PathVariable Long id, @Valid @RequestBody TriageReviewRequest request) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        triageService.review(id, request, email);
        return ResponseEntity.ok(new ApiResponse<>(true, "Triage reviewed and saved", null));
    }

    @GetMapping("/reports/{id}/duplicates")
    public ResponseEntity<ApiResponse<List<DuplicateCandidateResponse>>> duplicateCandidates(@PathVariable Long id) {
        return ResponseEntity.ok(new ApiResponse<>(true, "Duplicate candidates fetched", duplicateService.candidates(id)));
    }

    @PostMapping("/reports/{id}/duplicates/{canonicalId}")
    public ResponseEntity<ApiResponse<Void>> linkDuplicate(@PathVariable Long id, @PathVariable Long canonicalId,
            @RequestParam(required = false) String note) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        duplicateService.link(id, canonicalId, email, note);
        return ResponseEntity.ok(new ApiResponse<>(true, "Reports linked as possible duplicates", null));
    }

    @GetMapping("/users")
    public ResponseEntity<ApiResponse<List<UserResponse>>> getAllUsers() {
        return ResponseEntity.ok(new ApiResponse<>(true, "Users fetched", adminService.getAllUsers()));
    }

    @PostMapping("/users/workers")
    public ResponseEntity<ApiResponse<UserResponse>> createWorker(@Valid @RequestBody CreateWorkerRequest request) {
        UserResponse worker = adminService.createWorker(request);
        return new ResponseEntity<>(ApiResponse.success("Worker account created", worker), HttpStatus.CREATED);
    }

    @GetMapping("/users/{id}")
    public ResponseEntity<ApiResponse<UserResponse>> getUserById(@PathVariable Long id) {
        return ResponseEntity.ok(new ApiResponse<>(true, "User fetched", adminService.getUserById(id)));
    }

    @PatchMapping("/users/{id}/toggle")
    public ResponseEntity<ApiResponse<Void>> toggleUserEnabled(@PathVariable Long id) {
        adminService.toggleUserEnabled(id);
        return ResponseEntity.ok(new ApiResponse<>(true, "User status toggled", null));
    }

    @PostMapping("/categories")
    public ResponseEntity<ApiResponse<CategoryResponse>> createCategory(
            @RequestParam String name,
            @RequestParam String description,
            @RequestParam String icon,
            @RequestParam Long departmentId) {
        Category category = adminService.createCategory(name, description, icon, departmentId);
        Department department = category.getDepartment();
        CategoryResponse response = new CategoryResponse(category.getId(), category.getName(), category.getDescription(),
                category.getIcon(), department == null ? null : department.getId(),
                department == null ? null : department.getName(), category.isActive());
        return new ResponseEntity<>(new ApiResponse<>(true, "Category created", response), HttpStatus.CREATED);
    }

    @PostMapping("/departments")
    public ResponseEntity<ApiResponse<Department>> createDepartment(
            @RequestParam String name,
            @RequestParam String description,
            @RequestParam String contactEmail) {
        Department department = adminService.createDepartment(name, description, contactEmail);
        return new ResponseEntity<>(new ApiResponse<>(true, "Department created", department), HttpStatus.CREATED);
    }
}
