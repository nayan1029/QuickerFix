package com.quickerfix.service;

import com.quickerfix.entity.Category;
import com.quickerfix.enums.Severity;
import java.util.List;

/** Provider boundary permits an optional remote model without coupling the API to it. */
public interface TriageProvider {
    Result classify(String title, String description, List<Category> categories);
    record RankedCategory(Long categoryId, String categoryName, double confidence) { }
    record Result(Long categoryId, double confidence, String rationale, String source, Severity severity, List<RankedCategory> alternatives) { }
}
