package com.quickerfix.dto.response;

import com.quickerfix.enums.Role;
import lombok.Builder;
import lombok.Data;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserResponse {
    private Long id;
    private String name;
    private String email;
    private String phone;
    private Role role;
    private String departmentName;
    private Long departmentId;
    private boolean enabled;
    private LocalDateTime createdAt;
}
