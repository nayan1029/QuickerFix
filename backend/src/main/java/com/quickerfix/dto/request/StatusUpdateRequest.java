package com.quickerfix.dto.request;

import com.quickerfix.enums.ReportStatus;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class StatusUpdateRequest {
    @NotNull
    private ReportStatus newStatus;
    
    private String remark;
}
