package com.quickerfix.controller;

import com.quickerfix.dto.response.ApiResponse;
import com.quickerfix.dto.response.CategoryResponse;
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
    public ResponseEntity<ApiResponse<List<CategoryResponse>>> getAllCategories() {
        List<CategoryResponse> categories = categoryRepository.findByActive(true).stream().map(this::view).toList();
        return ResponseEntity.ok(ApiResponse.success("Categories fetched successfully", categories));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<CategoryResponse>> getCategoryById(@PathVariable Long id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id " + id));
        return ResponseEntity.ok(ApiResponse.success("Category fetched successfully", view(category)));
    }

    @GetMapping("/department/{departmentId}")
    public ResponseEntity<ApiResponse<List<CategoryResponse>>> getCategoriesByDepartment(@PathVariable Long departmentId) {
        Department department = departmentRepository.findById(departmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Department not found"));
        List<CategoryResponse> categories = categoryRepository.findByDepartment(department).stream().map(this::view).toList();
        return ResponseEntity.ok(ApiResponse.success("Categories fetched successfully", categories));
    }

    private CategoryResponse view(Category category) {
        Department department = category.getDepartment();
        return new CategoryResponse(category.getId(), category.getName(), category.getDescription(), category.getIcon(),
                department == null ? null : department.getId(), department == null ? null : department.getName(), category.isActive());
    }
}
