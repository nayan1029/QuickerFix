package com.quickerfix.controller;

import com.quickerfix.dto.response.ApiResponse;
import com.quickerfix.entity.Department;
import com.quickerfix.exception.ResourceNotFoundException;
import com.quickerfix.repository.DepartmentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/departments")
@RequiredArgsConstructor
public class DepartmentController {

    private final DepartmentRepository departmentRepository;

    @GetMapping
    public ResponseEntity<ApiResponse<List<Department>>> getAllDepartments() {
        List<Department> departments = departmentRepository.findAll();
        return ResponseEntity.ok(new ApiResponse<>(true, "Departments fetched successfully", departments));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Department>> getDepartmentById(@PathVariable Long id) {
        Department department = departmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Department not found with id " + id));
        return ResponseEntity.ok(new ApiResponse<>(true, "Department fetched successfully", department));
    }
}
