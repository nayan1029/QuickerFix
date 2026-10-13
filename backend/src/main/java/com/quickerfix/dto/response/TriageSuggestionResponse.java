package com.quickerfix.dto.response;

import com.quickerfix.enums.Severity;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TriageSuggestionResponse {
    private Long reportId;
    private Long categoryId;
    private String categoryName;
    private Long departmentId;
    private String departmentName;
    private Severity severity;
    private double confidence;
    private String rationale;
    private String source;
    private boolean reviewRequired;
    private List<Alternative> alternatives;

    @Data @NoArgsConstructor @AllArgsConstructor
    public static class Alternative {
        private Long categoryId;
        private String categoryName;
        private double confidence;
    }
}
