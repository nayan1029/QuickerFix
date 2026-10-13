package com.quickerfix.dto.request;

import com.quickerfix.enums.Role;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class RegisterRequest {
    @NotBlank
    @Size(max = 120)
    private String name;
    
    @NotBlank
    @Email
    @Size(max = 254)
    private String email;
    
    @NotBlank
    @Size(min = 12, max = 72)
    private String password;
    
    @Size(max = 32)
    private String phone;
    
    private Role role = Role.CITIZEN;
    
    private Long departmentId;
}
