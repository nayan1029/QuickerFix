package com.quickerfix.exception;

public class DuplicateReportException extends RuntimeException {
    private final Long originalReportId;

    public DuplicateReportException(String message, Long originalReportId) {
        super(message);
        this.originalReportId = originalReportId;
    }

    public Long getOriginalReportId() {
        return originalReportId;
    }
}
