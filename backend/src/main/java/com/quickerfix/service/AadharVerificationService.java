package com.quickerfix.service;
import com.quickerfix.entity.OtpRecord;
import com.quickerfix.repository.OtpRecordRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.HexFormat;
@Service @RequiredArgsConstructor
public class AadharVerificationService {
 private static final int MAX_ATTEMPTS = 5;
 private final OtpRecordRepository otpRecordRepository;
 private final PasswordEncoder passwordEncoder;
 private final SecureRandom secureRandom = new SecureRandom();
 public void requestOtp(String aadharNumber) {
  OtpRecord record = new OtpRecord(); String otp = String.format("%06d", secureRandom.nextInt(1_000_000));
  record.setSubjectHash(hash(aadharNumber)); record.setOtpHash(passwordEncoder.encode(otp));
  record.setExpiresAt(LocalDateTime.now().plusMinutes(5)); record.setAttempts(0); record.setVerified(false); record.setCreatedAt(LocalDateTime.now()); otpRecordRepository.save(record);
  // Integrate an approved SMS provider here. Plain OTPs are never returned or persisted.
 }
 public void verifyOtp(String aadharNumber, String otp) {
  OtpRecord record = otpRecordRepository.findTopBySubjectHashOrderByCreatedAtDesc(hash(aadharNumber)).orElseThrow(() -> new IllegalArgumentException("Request an OTP first."));
  if (record.isVerified()) throw new IllegalArgumentException("This OTP has already been used.");
  if (record.getExpiresAt().isBefore(LocalDateTime.now())) throw new IllegalArgumentException("OTP has expired.");
  if (record.getAttempts() >= MAX_ATTEMPTS) throw new IllegalArgumentException("Too many failed attempts. Request a new OTP.");
  record.setAttempts(record.getAttempts() + 1);
  if (!passwordEncoder.matches(otp, record.getOtpHash())) { otpRecordRepository.save(record); throw new IllegalArgumentException("Invalid OTP."); }
  record.setVerified(true); otpRecordRepository.save(record);
 }
 private String hash(String value) { try { return HexFormat.of().formatHex(MessageDigest.getInstance("SHA-256").digest(value.getBytes(StandardCharsets.UTF_8))); } catch (Exception e) { throw new IllegalStateException("Unable to protect identity reference", e); } }
}
