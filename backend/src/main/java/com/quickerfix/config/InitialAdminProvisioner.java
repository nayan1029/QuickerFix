package com.quickerfix.config;

import com.quickerfix.entity.User;
import com.quickerfix.enums.Role;
import com.quickerfix.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

/** Creates the first administrator only when explicitly configured and none exists. */
@Component
@RequiredArgsConstructor
public class InitialAdminProvisioner implements CommandLineRunner {
    private final UserRepository users;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.initial-admin.name:}")
    private String name;

    @Value("${app.initial-admin.email:}")
    private String email;

    @Value("${app.initial-admin.password:}")
    private String password;

    @Override
    public void run(String... args) {
        if (!StringUtils.hasText(name) || !StringUtils.hasText(email) || !StringUtils.hasText(password)) return;
        if (!users.findByRole(Role.ADMIN).isEmpty()) return;
        if (users.existsByEmail(email)) {
            throw new IllegalStateException("Initial administrator email is already used by a non-admin account");
        }

        User administrator = new User();
        administrator.setName(name.trim());
        administrator.setEmail(email.trim().toLowerCase());
        administrator.setPassword(passwordEncoder.encode(password));
        administrator.setRole(Role.ADMIN);
        administrator.setEnabled(true);
        users.save(administrator);
    }
}
