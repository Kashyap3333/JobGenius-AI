package com.jobmatcher.jobmatcher_backend.controller;

import com.jobmatcher.jobmatcher_backend.dto.ApplicationRequest;
import com.jobmatcher.jobmatcher_backend.dto.ApplicationResponse;
import com.jobmatcher.jobmatcher_backend.dto.ApplicationStatusRequest;
import com.jobmatcher.jobmatcher_backend.service.ApplicationService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/applications")
public class ApplicationController {

    @Autowired
    private ApplicationService applicationService;

    @PostMapping("/{jobId}")
    public ResponseEntity<ApplicationResponse> applyForJob(
            @PathVariable Long jobId,
            @RequestBody(required = false) ApplicationRequest request,
            Authentication authentication) {
        return new ResponseEntity<>(
                applicationService.applyForJob(jobId, request, authentication.getName()),
                HttpStatus.CREATED);
    }

    @GetMapping("/my")
    public ResponseEntity<List<ApplicationResponse>> getMyApplications(Authentication authentication) {
        return ResponseEntity.ok(applicationService.getMyApplications(authentication.getName()));
    }

    @GetMapping("/job/{jobId}")
    public ResponseEntity<List<ApplicationResponse>> getApplicationsForJob(
            @PathVariable Long jobId,
            Authentication authentication) {
        return ResponseEntity.ok(
                applicationService.getApplicationsForJob(jobId, authentication.getName()));
    }

    @PutMapping("/{applicationId}/status")
    public ResponseEntity<ApplicationResponse> updateStatus(
            @PathVariable Long applicationId,
            @Valid @RequestBody ApplicationStatusRequest request,
            Authentication authentication) {
        return ResponseEntity.ok(
                applicationService.updateStatus(applicationId, request, authentication.getName()));
    }

    @DeleteMapping("/{applicationId}")
    public ResponseEntity<Map<String, String>> withdrawApplication(
            @PathVariable Long applicationId,
            Authentication authentication) {
        applicationService.withdrawApplication(applicationId, authentication.getName());
        return ResponseEntity.ok(Map.of("message", "Application withdrawn successfully"));
    }

    @GetMapping("/check/{jobId}")
    public ResponseEntity<Map<String, Boolean>> checkApplied(
            @PathVariable Long jobId,
            Authentication authentication) {
        boolean applied = applicationService.hasApplied(jobId, authentication.getName());
        return ResponseEntity.ok(Map.of("applied", applied));
    }
}
