package com.jobmatcher.jobmatcher_backend.controller;

import com.jobmatcher.jobmatcher_backend.dto.ResumeResponse;
import com.jobmatcher.jobmatcher_backend.service.ResumeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/resume")
public class ResumeController {

    @Autowired
    private ResumeService resumeService;

    @PreAuthorize("hasRole('CANDIDATE')")
    @PostMapping("/upload")
    public ResponseEntity<ResumeResponse> uploadResume(
            @RequestParam("file") MultipartFile file,
            Authentication authentication) {

        String candidateEmail = authentication.getName();
        ResumeResponse response = resumeService.uploadResume(file, candidateEmail);
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @GetMapping("/{candidateId}")
    public ResponseEntity<ResumeResponse> getResume(@PathVariable Long candidateId) {
        return new ResponseEntity<>(resumeService.getResume(candidateId), HttpStatus.OK);
    }

    @PreAuthorize("hasRole('CANDIDATE')")
    @DeleteMapping("/{candidateId}")
    public ResponseEntity<String> deleteResume(
            @PathVariable Long candidateId,
            Authentication authentication) {

        String candidateEmail = authentication.getName();
        resumeService.deleteResume(candidateId, candidateEmail);
        return new ResponseEntity<>("Resume deleted successfully", HttpStatus.OK);
    }
}
