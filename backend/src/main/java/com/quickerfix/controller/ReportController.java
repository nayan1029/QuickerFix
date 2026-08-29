package com.quickerfix.controller;

import com.quickerfix.dto.request.CommentRequest;
import com.quickerfix.dto.request.RatingRequest;
import com.quickerfix.dto.request.RejectResolutionRequest;
import com.quickerfix.dto.request.ReportRequest;
import com.quickerfix.dto.request.StatusUpdateRequest;
import com.quickerfix.dto.response.ApiResponse;
import com.quickerfix.dto.response.ReportResponse;
import com.quickerfix.entity.Attachment;
import com.quickerfix.entity.Comment;
import com.quickerfix.entity.Rating;
import com.quickerfix.service.ReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/reports")
@RequiredArgsConstructor
public class ReportController {

    private final ReportService reportService;

    @PostMapping
    @PreAuthorize("hasRole('CITIZEN')")
    public ResponseEntity<ApiResponse<ReportResponse>> createReport(
            @RequestPart("request") ReportRequest request,
            @RequestPart(value = "photos", required = false) List<MultipartFile> photos) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        ReportResponse response = reportService.createReport(request, photos, email);
        return new ResponseEntity<>(new ApiResponse<>(true, "Report created successfully", response), HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<ApiResponse<Page<ReportResponse>>> getAllReports(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Page<ReportResponse> response = reportService.getAllReports(page, size);
        return ResponseEntity.ok(new ApiResponse<>(true, "Reports fetched successfully", response));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ReportResponse>> getReportById(@PathVariable Long id) {
        ReportResponse response = reportService.getReportById(id);
        return ResponseEntity.ok(new ApiResponse<>(true, "Report fetched successfully", response));
    }

    @GetMapping("/my")
    @PreAuthorize("hasRole('CITIZEN')")
    public ResponseEntity<ApiResponse<List<ReportResponse>>> getCitizenReports() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        List<ReportResponse> response = reportService.getCitizenReports(email);
        return ResponseEntity.ok(new ApiResponse<>(true, "My reports fetched successfully", response));
    }

    @GetMapping("/nearby")
    public ResponseEntity<ApiResponse<List<ReportResponse>>> getNearbyReports(
            @RequestParam Double lat,
            @RequestParam Double lng,
            @RequestParam(defaultValue = "500.0") Double radius) {
        List<ReportResponse> response = reportService.getNearbyReports(lat, lng, radius);
        return ResponseEntity.ok(new ApiResponse<>(true, "Nearby reports fetched successfully", response));
    }

    @PostMapping("/{id}/upvote")
    @PreAuthorize("hasRole('CITIZEN')")
    public ResponseEntity<ApiResponse<ReportResponse>> upvoteReport(@PathVariable Long id) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        ReportResponse response = reportService.upvoteReport(id, email);
        return ResponseEntity.ok(new ApiResponse<>(true, "Report upvoted successfully", response));
    }

    @PutMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('ADMIN', 'WORKER')")
    public ResponseEntity<ApiResponse<ReportResponse>> updateStatus(
            @PathVariable Long id,
            @RequestBody StatusUpdateRequest request) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        ReportResponse response = reportService.updateStatus(id, request, email);
        return ResponseEntity.ok(new ApiResponse<>(true, "Status updated successfully", response));
    }

    @PostMapping("/{id}/confirm")
    @PreAuthorize("hasRole('CITIZEN')")
    public ResponseEntity<ApiResponse<ReportResponse>> confirmResolution(@PathVariable Long id) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        ReportResponse response = reportService.confirmResolution(id, email);
        return ResponseEntity.ok(ApiResponse.success("Resolution confirmed successfully", response));
    }

    @PostMapping("/{id}/reject")
    @PreAuthorize("hasRole('CITIZEN')")
    public ResponseEntity<ApiResponse<ReportResponse>> rejectResolution(
            @PathVariable Long id,
            @RequestBody RejectResolutionRequest request) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        ReportResponse response = reportService.rejectResolution(id, request, email);
        return ResponseEntity.ok(ApiResponse.success("Resolution rejected successfully", response));
    }

    @PostMapping("/{id}/comments")
    public ResponseEntity<ApiResponse<Comment>> addComment(
            @PathVariable Long id,
            @RequestBody CommentRequest request) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        Comment comment = reportService.addComment(id, request, email);
        return new ResponseEntity<>(ApiResponse.success("Comment added successfully", comment), HttpStatus.CREATED);
    }

    @GetMapping("/{id}/comments")
    public ResponseEntity<ApiResponse<List<Comment>>> getComments(@PathVariable Long id) {
        List<Comment> comments = reportService.getComments(id);
        return ResponseEntity.ok(ApiResponse.success("Comments fetched successfully", comments));
    }

    @PostMapping("/{id}/attachments")
    public ResponseEntity<ApiResponse<Attachment>> uploadAttachment(
            @PathVariable Long id,
            @RequestParam("file") MultipartFile file) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        Attachment attachment = reportService.uploadAttachment(id, file, email, false);
        return new ResponseEntity<>(ApiResponse.success("Attachment uploaded successfully", attachment), HttpStatus.CREATED);
    }

    @PostMapping("/{id}/rate")
    @PreAuthorize("hasRole('CITIZEN')")
    public ResponseEntity<ApiResponse<Rating>> rateReport(
            @PathVariable Long id,
            @RequestBody RatingRequest request) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        Rating rating = reportService.rateReport(id, request, email);
        return new ResponseEntity<>(ApiResponse.success("Report rated successfully", rating), HttpStatus.CREATED);
    }
}
