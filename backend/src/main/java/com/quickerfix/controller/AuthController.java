package com.quickerfix.controller;

import com.quickerfix.dto.request.GoogleAuthRequest;
import com.quickerfix.dto.request.LoginRequest;
import com.quickerfix.dto.request.RegisterRequest;
import com.quickerfix.dto.response.ApiResponse;
import com.quickerfix.dto.response.AuthResponse;
import com.quickerfix.dto.response.UserResponse;
import com.quickerfix.service.AuthService;
import com.quickerfix.service.GoogleAuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final GoogleAuthService googleAuthService;

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<AuthResponse>> register(@RequestBody RegisterRequest request) {
        AuthResponse authResponse = authService.register(request);
        return new ResponseEntity<>(new ApiResponse<>(true, "Registration successful", authResponse), HttpStatus.CREATED);
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponse>> login(@RequestBody LoginRequest request) {
        AuthResponse authResponse = authService.login(request);
        return ResponseEntity.ok(new ApiResponse<>(true, "Login successful", authResponse));
    }

    @PostMapping("/google")
    public ResponseEntity<ApiResponse<AuthResponse>> googleLogin(@RequestBody GoogleAuthRequest request) {
        AuthResponse authResponse = googleAuthService.authenticateWithGoogle(request.getIdToken());
        return ResponseEntity.ok(new ApiResponse<>(true, "Google login successful", authResponse));
    }

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<UserResponse>> getCurrentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        UserResponse userResponse = authService.getCurrentUser(email);
        return ResponseEntity.ok(new ApiResponse<>(true, "User fetched successfully", userResponse));
    }
}
