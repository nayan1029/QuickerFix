package com.quickerfix.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class RejectResolutionRequest {
    @NotBlank
    private String reason;
}
