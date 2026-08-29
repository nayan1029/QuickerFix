package com.quickerfix.dto.request;

import com.quickerfix.enums.Severity;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class ReportRequest {
    @NotBlank
    private String title;
    
    private String description;
    
    @NotNull
    private Long categoryId;
    
    private Double latitude;
    private Double longitude;
    
    private String address;
    
    private Severity severity = Severity.MEDIUM;
}
