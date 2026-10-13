package com.quickerfix.dto.response;

public record CategoryResponse(Long id, String name, String description, String icon,
                               Long departmentId, String departmentName, boolean active) { }
