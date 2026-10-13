package com.quickerfix.controller;

import com.quickerfix.dto.response.ApiResponse;
import com.quickerfix.dto.response.AssignmentResponse;
import com.quickerfix.dto.response.ReportResponse;
import com.quickerfix.dto.request.RejectAssignmentRequest;
import com.quickerfix.entity.Assignment;
import com.quickerfix.service.AssignmentService;
import com.quickerfix.service.WorkerService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/worker")
@PreAuthorize("hasRole('WORKER')")
@RequiredArgsConstructor
public class WorkerController {

    private final WorkerService workerService;
    private final AssignmentService assignmentService;

    @GetMapping("/assignments")
    public ResponseEntity<ApiResponse<List<AssignmentResponse>>> getMyAssignments() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        List<AssignmentResponse> assignments = workerService.getMyAssignments(email).stream()
                .map(assignmentService::toResponse).toList();
        return ResponseEntity.ok(new ApiResponse<>(true, "Assignments fetched", assignments));
    }

    @GetMapping("/assignments/{id}")
    public ResponseEntity<ApiResponse<AssignmentResponse>> getAssignmentById(@PathVariable Long id) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        Assignment assignment = workerService.getAssignmentById(id, email);
        return ResponseEntity.ok(new ApiResponse<>(true, "Assignment fetched", assignmentService.toResponse(assignment)));
    }

    @PutMapping("/assignments/{id}/accept")
    public ResponseEntity<ApiResponse<AssignmentResponse>> acceptAssignment(@PathVariable Long id) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        Assignment assignment = assignmentService.acceptAssignment(id, email);
        return ResponseEntity.ok(new ApiResponse<>(true, "Assignment accepted", assignmentService.toResponse(assignment)));
    }

    @PutMapping("/assignments/{id}/reject")
    public ResponseEntity<ApiResponse<AssignmentResponse>> rejectAssignment(
            @PathVariable Long id,
            @jakarta.validation.Valid @RequestBody RejectAssignmentRequest request) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        Assignment assignment = assignmentService.rejectAssignment(id, request.reason(), email);
        return ResponseEntity.ok(new ApiResponse<>(true, "Assignment rejected", assignmentService.toResponse(assignment)));
    }

    @PostMapping("/reports/{reportId}/resolve")
    public ResponseEntity<ApiResponse<ReportResponse>> resolveReport(
            @PathVariable Long reportId,
            @RequestParam("photo") MultipartFile proofPhoto,
            @RequestParam(value = "remarks", required = false) String remarks) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        ReportResponse report = assignmentService.resolveReport(reportId, proofPhoto, email, remarks);
        return ResponseEntity.ok(new ApiResponse<>(true, "Report resolved", report));
    }

    @GetMapping("/stats")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getWorkerStats() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        Map<String, Object> stats = workerService.getWorkerStats(email);
        return ResponseEntity.ok(new ApiResponse<>(true, "Stats fetched", stats));
    }
}
