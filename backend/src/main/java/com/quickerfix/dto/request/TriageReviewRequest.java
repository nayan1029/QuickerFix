package com.quickerfix.dto.request;

import com.quickerfix.enums.Severity;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class TriageReviewRequest {
    @NotNull private Long categoryId;
    @NotNull private Severity severity;
    @Size(max = 500) private String note;
}
