package com.jobmatcher.jobmatcher_backend.controller;

import com.jobmatcher.jobmatcher_backend.dto.JobRequest;
import com.jobmatcher.jobmatcher_backend.dto.JobResponse;
import com.jobmatcher.jobmatcher_backend.model.Job;
import com.jobmatcher.jobmatcher_backend.service.JobService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/recruiter")
public class RecruiterJobController {

    @Autowired
    private JobService jobService;

    @PreAuthorize("hasRole('RECRUITER')")
    @PostMapping("/jobs")
    public ResponseEntity<?> createJob(@Valid @RequestBody JobRequest jobRequest ,
                                       Authentication authentication) {

        String recruiterEmail = authentication.getName();

        Job job =jobService.createJob(jobRequest, recruiterEmail);

        return new ResponseEntity<>(new JobResponse(job),HttpStatus.CREATED) ;

    }

}
