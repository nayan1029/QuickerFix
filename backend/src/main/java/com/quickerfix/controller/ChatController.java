package com.quickerfix.controller;
import com.quickerfix.dto.response.ApiResponse;
import com.quickerfix.entity.ChatMessage;
import com.quickerfix.service.ChatService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import java.util.List;
@RestController @RequestMapping("/api/chat") @RequiredArgsConstructor
public class ChatController {
 private final ChatService chatService;
 private String email() { return SecurityContextHolder.getContext().getAuthentication().getName(); }
 @GetMapping("/messages/{reportId}") public ResponseEntity<ApiResponse<List<ChatMessage>>> messages(@PathVariable Long reportId, @RequestParam(defaultValue = "0") int page) { return ResponseEntity.ok(ApiResponse.success("Messages fetched", chatService.messages(reportId, email(), page))); }
 @PostMapping("/messages") public ResponseEntity<ApiResponse<ChatMessage>> send(@Valid @RequestBody SendMessage request) { return ResponseEntity.ok(ApiResponse.success("Message sent", chatService.send(request.reportId(), request.recipientId(), request.content(), email()))); }
 @PatchMapping("/messages/{messageId}/read") public ResponseEntity<ApiResponse<Void>> read(@PathVariable Long messageId) { chatService.read(messageId, email()); return ResponseEntity.ok(ApiResponse.success("Message marked read", null)); }
 @GetMapping("/unread-count") public ResponseEntity<ApiResponse<Long>> unread() { return ResponseEntity.ok(ApiResponse.success("Unread count fetched", chatService.unread(email()))); }
 @PatchMapping("/room/{reportId}/read-all") public ResponseEntity<ApiResponse<Void>> readAll(@PathVariable Long reportId) { chatService.readAll(reportId, email()); return ResponseEntity.ok(ApiResponse.success("Messages marked read", null)); }
 public record SendMessage(@NotNull Long reportId, @NotNull Long recipientId, @NotBlank @Size(max = 1000) String content) {}
}
