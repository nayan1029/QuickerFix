package com.quickerfix.controller;
import com.quickerfix.dto.response.ApiResponse;
import com.quickerfix.service.AadharVerificationService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Pattern;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
@RestController @RequestMapping("/api/auth/aadhar") @RequiredArgsConstructor
public class AadharController {
 private final AadharVerificationService verificationService;
 @PostMapping("/request-otp")
 public ResponseEntity<ApiResponse<Void>> requestOtp(@Valid @RequestBody AadharRequest request) {
  verificationService.requestOtp(request.aadharNumber());
  return ResponseEntity.ok(ApiResponse.success("OTP requested. Check your configured delivery channel.", null));
 }
 @PostMapping("/verify-otp")
 public ResponseEntity<ApiResponse<Void>> verifyOtp(@Valid @RequestBody OtpRequest request) {
  verificationService.verifyOtp(request.aadharNumber(), request.otp());
  return ResponseEntity.ok(ApiResponse.success("Aadhaar verification completed.", null));
 }
 public record AadharRequest(@Pattern(regexp = "^[1-9]\\d{11}$", message = "Aadhaar number must be 12 digits and cannot start with zero") String aadharNumber) {}
 public record OtpRequest(@Pattern(regexp = "^[1-9]\\d{11}$") String aadharNumber, @Pattern(regexp = "^\\d{6}$", message = "OTP must be 6 digits") String otp) {}
}
