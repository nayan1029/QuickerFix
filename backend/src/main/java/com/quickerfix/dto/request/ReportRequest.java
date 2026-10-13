package com.quickerfix.dto.request;

import com.quickerfix.enums.Severity;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Positive;
import lombok.Data;

@Data
public class ReportRequest {
    @NotBlank
    @Size(max = 160)
    private String title;
    
    @NotBlank
    @Size(max = 5000)
    private String description;
    
    @NotNull
    @Positive
    private Long categoryId;
    
    @DecimalMin("-90.0")
    @DecimalMax("90.0")
    private Double latitude;
    @DecimalMin("-180.0")
    @DecimalMax("180.0")
    private Double longitude;
    
    @Size(max = 255)
    private String address;
    
    @NotNull
    private Severity severity = Severity.MEDIUM;
}
