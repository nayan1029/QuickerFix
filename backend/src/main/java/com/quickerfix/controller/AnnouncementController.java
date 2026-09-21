package com.quickerfix.controller;
import com.quickerfix.dto.response.ApiResponse;
import com.quickerfix.entity.*;
import com.quickerfix.enums.Role;
import com.quickerfix.exception.ResourceNotFoundException;
import com.quickerfix.exception.UnauthorizedException;
import com.quickerfix.repository.*;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDateTime;
import java.util.*;
@RestController @RequestMapping("/api/announcements") @RequiredArgsConstructor
public class AnnouncementController {
 private final AnnouncementRepository announcements; private final AnnouncementReadRepository reads; private final UserRepository users;
 private User user(){return users.findByEmail(SecurityContextHolder.getContext().getAuthentication().getName()).orElseThrow(()->new ResourceNotFoundException("User not found"));}
 @GetMapping public ResponseEntity<ApiResponse<List<Map<String,Object>>>> all(@RequestParam(defaultValue="ALL") String scope){ User u=user(); return ResponseEntity.ok(ApiResponse.success("Announcements fetched", announcements.findByExpiresAtIsNullOrExpiresAtAfterOrderByCreatedAtDesc(LocalDateTime.now()).stream().filter(a->scope.equals("ALL")||a.getScope().equals(scope)).map(a->view(a,u)).toList())); }
 @GetMapping("/high-priority") public ResponseEntity<ApiResponse<List<Map<String,Object>>>> high(){User u=user(); return ResponseEntity.ok(ApiResponse.success("High priority announcements fetched",announcements.findByExpiresAtIsNullOrExpiresAtAfterOrderByCreatedAtDesc(LocalDateTime.now()).stream().filter(a->"HIGH".equals(a.getPriority())).map(a->view(a,u)).toList()));}
 @PostMapping public ResponseEntity<ApiResponse<Map<String,Object>>> create(@Valid @RequestBody Create r){User u=user();if(u.getRole()!=Role.ADMIN)throw new UnauthorizedException("Only admins can publish announcements");Announcement a=new Announcement();a.setTitle(r.title());a.setContent(r.content());a.setScope(r.scope());a.setPriority(r.priority());a.setTargetDistrictId(r.targetDistrictId());a.setTargetCategoryId(r.targetCategoryId());a.setExpiresAt(r.expiresAt());a.setCreatedBy(u);a.setCreatedAt(LocalDateTime.now());a=announcements.save(a);return ResponseEntity.ok(ApiResponse.success("Announcement created",view(a,u)));}
 @PatchMapping("/{id}/read") public ResponseEntity<ApiResponse<Void>> read(@PathVariable Long id){User u=user();Announcement a=announcements.findById(id).orElseThrow(()->new ResourceNotFoundException("Announcement not found"));if(reads.findByAnnouncementAndUser(a,u).isEmpty()){AnnouncementRead r=new AnnouncementRead();r.setAnnouncement(a);r.setUser(u);r.setReadAt(LocalDateTime.now());reads.save(r);}return ResponseEntity.ok(ApiResponse.success("Announcement marked read",null));}
 @GetMapping("/unread-count") public ResponseEntity<ApiResponse<Map<String,Long>>> unread(){User u=user();long total=announcements.findByExpiresAtIsNullOrExpiresAtAfterOrderByCreatedAtDesc(LocalDateTime.now()).size();return ResponseEntity.ok(ApiResponse.success("Unread count fetched",Map.of("count",Math.max(0,total-reads.countByUser(u)))));}
 private Map<String,Object> view(Announcement a,User u){Map<String,Object> m=new LinkedHashMap<>();m.put("id",a.getId());m.put("title",a.getTitle());m.put("content",a.getContent());m.put("scope",a.getScope());m.put("priority",a.getPriority());m.put("createdAt",a.getCreatedAt());m.put("expiresAt",a.getExpiresAt());m.put("isRead",reads.findByAnnouncementAndUser(a,u).isPresent());return m;}
 public record Create(@NotBlank @Size(max=255) String title,@NotBlank @Size(max=5000) String content,@Pattern(regexp="ALL|DISTRICT|CATEGORY") String scope,@Pattern(regexp="LOW|MEDIUM|HIGH") String priority,Long targetDistrictId,Long targetCategoryId,LocalDateTime expiresAt){}
}
