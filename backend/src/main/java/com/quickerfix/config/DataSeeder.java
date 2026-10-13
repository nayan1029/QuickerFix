package com.quickerfix.config;

import com.quickerfix.entity.Category;
import com.quickerfix.entity.Department;
import com.quickerfix.repository.CategoryRepository;
import com.quickerfix.repository.DepartmentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.List;

/** Seeds the service catalog only. User accounts are always created through real account flows. */
@Component
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {
    private final DepartmentRepository departments;
    private final CategoryRepository categories;

    @Override
    public void run(String... args) {
        Department roads = department("Roads & Infrastructure", "roads@quickerfix.gov");
        Department electrical = department("Electrical & Street Lighting", "electrical@quickerfix.gov");
        Department sanitation = department("Sanitation & Waste Management", "sanitation@quickerfix.gov");
        Department water = department("Water & Sewage", "water@quickerfix.gov");
        Department parks = department("Parks & Environment", "parks@quickerfix.gov");

        category("Potholes", "Road", roads);
        category("Damaged Roads", "Road", roads);
        category("Broken Streetlights", "Lighting", electrical);
        category("Electrical Hazards", "Electrical", electrical);
        category("Garbage Accumulation", "Waste", sanitation);
        category("Water Leakage", "Water", water);
        category("Fallen Trees", "Parks", parks);
        category("Public Infrastructure", "Infrastructure", roads);
    }

    private Department department(String name, String email) {
        return departments.findByName(name).orElseGet(() -> {
            Department department = new Department();
            department.setName(name);
            department.setContactEmail(email);
            department.setActive(true);
            return departments.save(department);
        });
    }

    private void category(String name, String icon, Department department) {
        if (categories.findByName(name).isPresent()) return;
        Category category = new Category();
        category.setName(name);
        category.setIcon(icon);
        category.setDepartment(department);
        category.setActive(true);
        categories.save(category);
    }
}
