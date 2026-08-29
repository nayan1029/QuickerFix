package com.quickerfix.controller;

import com.quickerfix.dto.response.ApiResponse;
import com.quickerfix.entity.Category;
import com.quickerfix.entity.Department;
import com.quickerfix.exception.ResourceNotFoundException;
import com.quickerfix.repository.CategoryRepository;
import com.quickerfix.repository.DepartmentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/categories")
@RequiredArgsConstructor
public class CategoryController {

    private final CategoryRepository categoryRepository;
    private final DepartmentRepository departmentRepository;

    @GetMapping
    public ResponseEntity<ApiResponse<List<Category>>> getAllCategories() {
        List<Category> categories = categoryRepository.findAll();
        return ResponseEntity.ok(new ApiResponse<>(true, "Categories fetched successfully", categories));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Category>> getCategoryById(@PathVariable Long id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id " + id));
        return ResponseEntity.ok(new ApiResponse<>(true, "Category fetched successfully", category));
    }

    @GetMapping("/department/{departmentId}")
    public ResponseEntity<ApiResponse<List<Category>>> getCategoriesByDepartment(@PathVariable Long departmentId) {
        Department department = departmentRepository.findById(departmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Department not found"));
        List<Category> categories = categoryRepository.findByDepartment(department);
        return ResponseEntity.ok(new ApiResponse<>(true, "Categories fetched successfully", categories));
    }
}
