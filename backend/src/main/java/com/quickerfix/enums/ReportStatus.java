package com.quickerfix.enums;

public enum ReportStatus {
    REPORTED,
    UNDER_REVIEW,
    VERIFIED,
    ASSIGNED,
    IN_PROGRESS,
    RESOLVED,
    CITIZEN_VERIFICATION,
    CLOSED,
    REOPENED;

    public boolean canTransitionTo(ReportStatus next) {
        if (next == null) {
            return false;
        }
        return switch (this) {
            case REPORTED -> next == UNDER_REVIEW;
            case UNDER_REVIEW -> next == VERIFIED || next == REPORTED;
            case VERIFIED -> next == ASSIGNED;
            case ASSIGNED -> next == IN_PROGRESS;
            case IN_PROGRESS -> next == RESOLVED;
            case RESOLVED -> next == CITIZEN_VERIFICATION;
            case CITIZEN_VERIFICATION -> next == CLOSED || next == REOPENED;
            case REOPENED -> next == IN_PROGRESS;
            case CLOSED -> false;
        };
    }
}
