package com.quickerfix.repository;

import com.quickerfix.entity.Category;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CategoryRepository extends JpaRepository<Category, Long> {
    Optional<Category> findByName(String name);
    List<Category> findByActive(boolean active);
    List<Category> findByDepartmentId(Long departmentId);
}
