package com.quickerfix.controller;

import com.quickerfix.dto.request.AuthorityContactRequest;
import com.quickerfix.dto.response.ApiResponse;
import com.quickerfix.dto.response.AuthorityContactResponse;
import com.quickerfix.service.AuthorityContactService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController @RequestMapping("/api/contacts") @RequiredArgsConstructor
public class AuthorityContactController {
    private final AuthorityContactService service;

    @GetMapping public ResponseEntity<ApiResponse<List<AuthorityContactResponse>>> list(
            @RequestParam(required=false) String state, @RequestParam(required=false) String district,
            @RequestParam(required=false) String serviceType) {
        return ResponseEntity.ok(ApiResponse.success("Authority contacts fetched", service.find(state,district,serviceType)));
    }

    @GetMapping("/manage") @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<AuthorityContactResponse>>> manage() {
        return ResponseEntity.ok(ApiResponse.success("Managed contacts fetched",service.findAllForAdmin()));
    }

    @PostMapping @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<AuthorityContactResponse>> create(@Valid @RequestBody AuthorityContactRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success("Authority contact created", service.create(request)));
    }

    @PutMapping("/{id}") @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<AuthorityContactResponse>> update(@PathVariable Long id,@Valid @RequestBody AuthorityContactRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Authority contact updated",service.update(id,request)));
    }

    @DeleteMapping("/{id}") @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> withdraw(@PathVariable Long id) {
        service.withdraw(id); return ResponseEntity.ok(ApiResponse.success("Authority contact withdrawn",null));
    }
}
