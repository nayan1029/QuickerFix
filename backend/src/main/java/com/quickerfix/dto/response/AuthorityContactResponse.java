package com.quickerfix.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;

@Data @NoArgsConstructor @AllArgsConstructor
public class AuthorityContactResponse {
    private Long id; private String authorityName; private String serviceType; private String phone;
    private String alternatePhone; private String email; private String address; private String state;
    private String district; private String coverage; private String instructions; private String officialSourceUrl;
    private LocalDate verifiedAt; private boolean emergency; private boolean active;
}
