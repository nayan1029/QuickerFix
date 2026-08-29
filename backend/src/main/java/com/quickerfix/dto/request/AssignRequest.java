package com.quickerfix.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class AssignRequest {
    @NotNull
    private Long workerId;
    
    private String remark;
}
