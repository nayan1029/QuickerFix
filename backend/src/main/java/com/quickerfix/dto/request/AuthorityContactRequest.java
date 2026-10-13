package com.quickerfix.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;
import java.time.LocalDate;

@Data
public class AuthorityContactRequest {
    @NotBlank @Size(max=120) private String authorityName;
    @NotBlank @Size(max=40) private String serviceType;
    @Size(max=40) @Pattern(regexp="[+0-9() .-]*") private String phone;
    @Size(max=40) @Pattern(regexp="[+0-9() .-]*") private String alternatePhone;
    @Email @Size(max=160) private String email;
    @Size(max=240) private String address;
    @NotBlank @Size(max=80) private String state;
    @Size(max=100) private String district;
    @NotBlank @Pattern(regexp="(?i)NATIONAL|STATE|DISTRICT|LOCAL") private String coverage;
    @Size(max=1200) private String instructions;
    @NotBlank @Size(max=500) private String officialSourceUrl;
    @NotNull private LocalDate verifiedAt;
    private boolean emergency;
    private boolean active = true;
}
