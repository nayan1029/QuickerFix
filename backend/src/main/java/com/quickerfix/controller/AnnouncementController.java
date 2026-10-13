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
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDateTime;
import java.util.*;
@RestController @RequestMapping("/api/announcements") @RequiredArgsConstructor
public class AnnouncementController {
 private final AnnouncementRepository announcements; private final AnnouncementReadRepository reads; private final UserRepository users;
 private User user(){return users.findByEmail(SecurityContextHolder.getContext().getAuthentication().getName()).orElseThrow(()->new ResourceNotFoundException("User not found"));}
 private User optionalUser(Authentication authentication){if(authentication==null||!authentication.isAuthenticated()||"anonymousUser".equals(authentication.getPrincipal()))return null;return users.findByEmail(authentication.getName()).orElse(null);}
 @GetMapping public ResponseEntity<ApiResponse<List<Map<String,Object>>>> all(@RequestParam(defaultValue="ALL") String scope,@RequestParam(required=false) Long targetDistrictId,@RequestParam(required=false) Long targetCategoryId,Authentication authentication){if(!Set.of("ALL","DISTRICT","CATEGORY").contains(scope))throw new IllegalArgumentException("Invalid announcement scope");User u=optionalUser(authentication);List<Map<String,Object>> items=announcements.findByExpiresAtIsNullOrExpiresAtAfterOrderByCreatedAtDesc(LocalDateTime.now()).stream().filter(a->"ALL".equals(a.getScope())||scope.equals(a.getScope())).filter(a->!"DISTRICT".equals(a.getScope())||targetDistrictId!=null&&Objects.equals(targetDistrictId,a.getTargetDistrictId())).filter(a->!"CATEGORY".equals(a.getScope())||targetCategoryId!=null&&Objects.equals(targetCategoryId,a.getTargetCategoryId())).map(a->view(a,u)).toList();return ResponseEntity.ok(ApiResponse.success("Announcements fetched",items)); }
 @GetMapping("/high-priority") public ResponseEntity<ApiResponse<List<Map<String,Object>>>> high(Authentication authentication){User u=optionalUser(authentication);return ResponseEntity.ok(ApiResponse.success("High priority announcements fetched",announcements.findByExpiresAtIsNullOrExpiresAtAfterOrderByCreatedAtDesc(LocalDateTime.now()).stream().filter(a->"HIGH".equals(a.getPriority())&&"ALL".equals(a.getScope())).map(a->view(a,u)).toList()));}
 @PostMapping public ResponseEntity<ApiResponse<Map<String,Object>>> create(@Valid @RequestBody Create r){User u=user();if(u.getRole()!=Role.ADMIN)throw new UnauthorizedException("Only admins can publish announcements");if("DISTRICT".equals(r.scope())&&r.targetDistrictId()==null||"CATEGORY".equals(r.scope())&&r.targetCategoryId()==null)throw new IllegalArgumentException("Choose the target for this announcement audience");if(r.expiresAt()!=null&&!r.expiresAt().isAfter(LocalDateTime.now()))throw new IllegalArgumentException("Expiry must be in the future");Announcement a=new Announcement();a.setTitle(r.title());a.setContent(r.content());a.setScope(r.scope());a.setPriority(r.priority());a.setTargetDistrictId(r.targetDistrictId());a.setTargetCategoryId(r.targetCategoryId());a.setExpiresAt(r.expiresAt());a.setCreatedBy(u);a.setCreatedAt(LocalDateTime.now());a=announcements.save(a);return ResponseEntity.ok(ApiResponse.success("Announcement created",view(a,u)));}
 @PatchMapping("/{id}/read") public ResponseEntity<ApiResponse<Void>> read(@PathVariable Long id){User u=user();Announcement a=announcements.findById(id).orElseThrow(()->new ResourceNotFoundException("Announcement not found"));if(reads.findByAnnouncementAndUser(a,u).isEmpty()){AnnouncementRead r=new AnnouncementRead();r.setAnnouncement(a);r.setUser(u);r.setReadAt(LocalDateTime.now());reads.save(r);}return ResponseEntity.ok(ApiResponse.success("Announcement marked read",null));}
 @GetMapping("/unread-count") public ResponseEntity<ApiResponse<Map<String,Long>>> unread(){User u=user();long count=reads.countUnreadPublicNotices(u,LocalDateTime.now());return ResponseEntity.ok(ApiResponse.success("Unread count fetched",Map.of("count",count)));}
 @DeleteMapping("/{id}") public ResponseEntity<ApiResponse<Void>> withdraw(@PathVariable Long id){User u=user();if(u.getRole()!=Role.ADMIN)throw new UnauthorizedException("Only administrators can withdraw announcements");Announcement a=announcements.findById(id).orElseThrow(()->new ResourceNotFoundException("Announcement not found"));reads.deleteByAnnouncement(a);announcements.delete(a);return ResponseEntity.ok(ApiResponse.success("Announcement withdrawn",null));}
 private Map<String,Object> view(Announcement a,User u){Map<String,Object> m=new LinkedHashMap<>();m.put("id",a.getId());m.put("title",a.getTitle());m.put("content",a.getContent());m.put("scope",a.getScope());m.put("priority",a.getPriority());m.put("targetDistrictId",a.getTargetDistrictId());m.put("targetCategoryId",a.getTargetCategoryId());m.put("createdAt",a.getCreatedAt());m.put("expiresAt",a.getExpiresAt());m.put("isRead",u!=null&&reads.findByAnnouncementAndUser(a,u).isPresent());return m;}
 public record Create(@NotBlank @Size(max=255) String title,@NotBlank @Size(max=5000) String content,@NotBlank @Pattern(regexp="ALL|DISTRICT|CATEGORY") String scope,@NotBlank @Pattern(regexp="LOW|MEDIUM|HIGH") String priority,Long targetDistrictId,Long targetCategoryId,LocalDateTime expiresAt){}
}
