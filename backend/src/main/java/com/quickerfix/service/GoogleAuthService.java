package com.quickerfix.service;

import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import com.quickerfix.dto.response.AuthResponse;
import com.quickerfix.entity.User;
import com.quickerfix.enums.Role;
import com.quickerfix.repository.UserRepository;
import com.quickerfix.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class GoogleAuthService {

    private final UserRepository userRepository;
    private final JwtService jwtService;
    private final PasswordEncoder passwordEncoder;

    @Value("${google.client.id}")
    private String googleClientId;

    public AuthResponse authenticateWithGoogle(String idToken) {
        GoogleIdToken.Payload payload = verifyToken(idToken);

        String googleId = payload.getSubject();
        String email    = payload.getEmail();
        String name     = (String) payload.get("name");

        // 1. Try to find by googleId first (fastest path for returning users)
        Optional<User> byGoogleId = userRepository.findByGoogleId(googleId);
        if (byGoogleId.isPresent()) {
            User user = byGoogleId.get();
            return toAuthResponse(jwtService.generateToken(user), user);
        }

        // 2. Try to find by email (user may have registered with email/password before)
        Optional<User> byEmail = userRepository.findByEmail(email);
        if (byEmail.isPresent()) {
            // Link the Google account to the existing user
            User user = byEmail.get();
            user.setGoogleId(googleId);
            user = userRepository.save(user);
            return toAuthResponse(jwtService.generateToken(user), user);
        }

        // 3. Brand new user — create a citizen account
        User newUser = User.builder()
                .name(name != null ? name : email)
                .email(email)
                .password(passwordEncoder.encode(UUID.randomUUID().toString()))
                .role(Role.CITIZEN)
                .googleId(googleId)
                .enabled(true)
                .build();

        newUser = userRepository.save(newUser);
        return toAuthResponse(jwtService.generateToken(newUser), newUser);
    }

    private GoogleIdToken.Payload verifyToken(String idTokenString) {
        try {
            GoogleIdTokenVerifier verifier = new GoogleIdTokenVerifier.Builder(
                    new NetHttpTransport(), GsonFactory.getDefaultInstance())
                    .setAudience(Collections.singletonList(googleClientId))
                    .build();

            GoogleIdToken idToken = verifier.verify(idTokenString);
            if (idToken == null) {
                throw new IllegalArgumentException("Invalid Google ID token");
            }
            return idToken.getPayload();
        } catch (IllegalArgumentException e) {
            throw e;
        } catch (Exception e) {
            throw new IllegalArgumentException("Google token verification failed: " + e.getMessage(), e);
        }
    }

    private AuthResponse toAuthResponse(String token, User user) {
        return new AuthResponse(token, user.getId(), user.getName(), user.getEmail(), user.getRole());
    }
}
