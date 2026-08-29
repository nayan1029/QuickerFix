package com.quickerfix.dto.response;

import com.quickerfix.enums.Role;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class AuthResponse {
    private String token;
    @Builder.Default
    private String tokenType = "Bearer";
    private Long userId;
    private String name;
    private String email;
    private Role role;
}
