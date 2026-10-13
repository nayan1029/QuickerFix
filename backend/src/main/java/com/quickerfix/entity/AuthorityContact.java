package com.quickerfix.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;

@Entity @Table(name = "authority_contacts") @Data @NoArgsConstructor
public class AuthorityContact {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @Column(nullable = false, length = 120) private String authorityName;
    @Column(nullable = false, length = 40) private String serviceType;
    @Column(length = 40) private String phone;
    @Column(length = 40) private String alternatePhone;
    @Column(length = 160) private String email;
    @Column(length = 240) private String address;
    @Column(nullable = false, length = 80) private String state;
    @Column(length = 100) private String district;
    @Column(nullable = false, length = 24) private String coverage;
    @Column(length = 1200) private String instructions;
    @Column(length = 500) private String officialSourceUrl;
    private LocalDate verifiedAt;
    @Column(nullable = false) private boolean emergency;
    @Column(nullable = false) private boolean active = true;
}
