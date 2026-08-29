package com.quickerfix.service;

import com.quickerfix.entity.Assignment;
import com.quickerfix.entity.User;
import com.quickerfix.enums.AssignmentStatus;
import com.quickerfix.exception.ResourceNotFoundException;
import com.quickerfix.exception.UnauthorizedException;
import com.quickerfix.repository.AssignmentRepository;
import com.quickerfix.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class WorkerService {

    private final AssignmentRepository assignmentRepository;
    private final UserRepository userRepository;

    public List<Assignment> getMyAssignments(String workerEmail) {
        User worker = userRepository.findByEmail(workerEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Worker not found"));
        return assignmentRepository.findByWorker(worker);
    }

    public Assignment getAssignmentById(Long id, String workerEmail) {
        Assignment assignment = assignmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Assignment not found"));
        if (!assignment.getWorker().getEmail().equals(workerEmail)) {
            throw new UnauthorizedException("Not your assignment");
        }
        return assignment;
    }

    public Map<String, Object> getWorkerStats(String workerEmail) {
        User worker = userRepository.findByEmail(workerEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Worker not found"));
                
        List<Assignment> assignments = assignmentRepository.findByWorker(worker);
        
        long resolvedCount = assignments.stream()
                .filter(a -> a.getStatus() == AssignmentStatus.COMPLETED)
                .count();
        long inProgressCount = assignments.stream()
                .filter(a -> a.getStatus() == AssignmentStatus.ACCEPTED)
                .count();
        long pendingCount = assignments.stream()
                .filter(a -> a.getStatus() == AssignmentStatus.PENDING)
                .count();
                
        Map<String, Object> stats = new HashMap<>();
        stats.put("resolvedCount", resolvedCount);
        stats.put("inProgressCount", inProgressCount);
        stats.put("pendingCount", pendingCount);
        stats.put("totalAssignments", assignments.size());
        
        return stats;
    }
}
