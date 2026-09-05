package com.quickerfix.controller;

import java.util.regex.Pattern;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/aadhar")
public class AadharController {
    
    // Add your Aadhar verification logic here
    @PostMapping("/verify")
    public String verifyAadhar(@Valid AadharRequest request) {
        String aadharNumber = request.aadharNumber().trim();

        // Enhanced regex for Aadhar validation (12 digits, no leading zeros)
        String regexPattern = "^[1-9]\\d{11}$";

        // Handle common input errors
        if (aadharNumber.length() < 12 || aadharNumber.length() > 12) {
            return "Aadhar number must be exactly 12 digits";
        }
    
        if (!Pattern.matches(regexPattern, aadharNumber)) {
            return "Invalid Aadhar format. Must be 12 digits starting with non-zero (e.g., 987654321012)";
        }

        // Add user-friendly success message
        return "Aadhar verified successfully! You can now submit your complaint.";
    }

    // DTO for Aadhar validation requests
    public record AadharRequest(String aadharNumber) {}
}

