package com.quickerfix;

import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
public class UserController {
    // Add user registration endpoint here
    @PostMapping("/register")
    public String registerUser() {
        return "User registration successful";
    }
}