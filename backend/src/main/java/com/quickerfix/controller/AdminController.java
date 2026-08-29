package com.quickerfix.controller;

import com.quickerfix.dto.request.AssignRequest;
import com.quickerfix.dto.response.ApiResponse;
import com.quickerfix.dto.response.DashboardResponse;
import com.quickerfix.dto.response.ReportResponse;
import com.quickerfix.dto.response.UserResponse;
import com.quickerfix.entity.Assignment;
import com.quickerfix.entity.Category;
import com.quickerfix.entity.Department;
import com.quickerfix.enums.ReportStatus;
import com.quickerfix.service.AdminService;
import com.quickerfix.service.AssignmentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
public class AdminController {

    private final AdminService adminService;
    private final AssignmentService assignmentService;

    @GetMapping("/dashboard")
    public ResponseEntity<ApiResponse<DashboardResponse>> getDashboard() {
        return ResponseEntity.ok(new ApiResponse<>(true, "Dashboard fetched", adminService.getDashboard()));
    }

    @GetMapping("/reports")
    public ResponseEntity<ApiResponse<List<ReportResponse>>> getReportsByStatus(@RequestParam(required = false) ReportStatus status) {
        List<ReportResponse> reports = (status != null) 
                ? adminService.getReportsByStatus(status) 
                : adminService.getPriorityQueue();
        return ResponseEntity.ok(new ApiResponse<>(true, "Reports fetched", reports));
    }

    @GetMapping("/reports/priority")
    public ResponseEntity<ApiResponse<List<ReportResponse>>> getPriorityQueue() {
        return ResponseEntity.ok(new ApiResponse<>(true, "Priority queue fetched", adminService.getPriorityQueue()));
    }

    @DeleteMapping("/reports/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteReport(@PathVariable Long id) {
        adminService.deleteReport(id);
        return ResponseEntity.ok(new ApiResponse<>(true, "Report deleted successfully", null));
    }

    @PostMapping("/reports/{id}/assign")
    public ResponseEntity<ApiResponse<Assignment>> assignWorker(@PathVariable Long id, @RequestBody AssignRequest request) {
        String adminEmail = SecurityContextHolder.getContext().getAuthentication().getName();
        Assignment assignment = assignmentService.assignWorker(id, request, adminEmail);
        return ResponseEntity.ok(new ApiResponse<>(true, "Worker assigned successfully", assignment));
    }

    @GetMapping("/users")
    public ResponseEntity<ApiResponse<List<UserResponse>>> getAllUsers() {
        return ResponseEntity.ok(new ApiResponse<>(true, "Users fetched", adminService.getAllUsers()));
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
    public ResponseEntity<ApiResponse<Category>> createCategory(
            @RequestParam String name,
            @RequestParam String description,
            @RequestParam String icon,
            @RequestParam Long departmentId) {
        Category category = adminService.createCategory(name, description, icon, departmentId);
        return new ResponseEntity<>(new ApiResponse<>(true, "Category created", category), HttpStatus.CREATED);
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
