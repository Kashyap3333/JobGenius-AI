package com.jobmatcher.jobmatcher_backend.service;

import com.jobmatcher.jobmatcher_backend.dto.ApplicationRequest;
import com.jobmatcher.jobmatcher_backend.dto.ApplicationResponse;
import com.jobmatcher.jobmatcher_backend.dto.ApplicationStatusRequest;
import com.jobmatcher.jobmatcher_backend.enums.ApplicationStatus;
import com.jobmatcher.jobmatcher_backend.enums.RoleEnum;
import com.jobmatcher.jobmatcher_backend.model.Application;
import com.jobmatcher.jobmatcher_backend.model.Job;
import com.jobmatcher.jobmatcher_backend.model.User;
import com.jobmatcher.jobmatcher_backend.repository.ApplicationRepository;
import com.jobmatcher.jobmatcher_backend.repository.JobRepository;
import com.jobmatcher.jobmatcher_backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class ApplicationService {

    @Autowired
    private ApplicationRepository applicationRepository;

    @Autowired
    private JobRepository jobRepository;

    @Autowired
    private UserRepository userRepository;

    public ApplicationResponse applyForJob(Long jobId, ApplicationRequest request, String candidateEmail) {
        User candidate = userRepository.findByEmail(candidateEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (candidate.getRole() != RoleEnum.CANDIDATE) {
            throw new RuntimeException("Only candidates can apply for jobs");
        }

        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new RuntimeException("Job not found"));

        if (applicationRepository.existsByCandidateIdAndJobId(candidate.getId(), jobId)) {
            throw new RuntimeException("You have already applied for this job");
        }

        Application application = new Application();
        application.setCandidate(candidate);
        application.setJob(job);
        application.setStatus(ApplicationStatus.APPLIED);
        application.setAppliedAt(LocalDateTime.now());
        application.setCoverLetter(request != null ? request.getCoverLetter() : null);

        return new ApplicationResponse(applicationRepository.save(application));
    }

    public List<ApplicationResponse> getMyApplications(String candidateEmail) {
        User candidate = userRepository.findByEmail(candidateEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return applicationRepository.findByCandidateId(candidate.getId())
                .stream()
                .map(ApplicationResponse::new)
                .collect(Collectors.toList());
    }

    public List<ApplicationResponse> getApplicationsForJob(Long jobId, String recruiterEmail) {
        User recruiter = userRepository.findByEmail(recruiterEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new RuntimeException("Job not found"));

        if (!job.getCreatedBy().getId().equals(recruiter.getId())) {
            throw new RuntimeException("You are not authorized to view applications for this job");
        }

        return applicationRepository.findByJobId(jobId)
                .stream()
                .map(ApplicationResponse::new)
                .collect(Collectors.toList());
    }

    public ApplicationResponse updateStatus(Long applicationId, ApplicationStatusRequest request, String recruiterEmail) {
        User recruiter = userRepository.findByEmail(recruiterEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Application application = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new RuntimeException("Application not found"));

        if (!application.getJob().getCreatedBy().getId().equals(recruiter.getId())) {
            throw new RuntimeException("You are not authorized to update this application");
        }

        application.setStatus(request.getStatus());
        return new ApplicationResponse(applicationRepository.save(application));
    }

    public void withdrawApplication(Long applicationId, String candidateEmail) {
        User candidate = userRepository.findByEmail(candidateEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Application application = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new RuntimeException("Application not found"));

        if (!application.getCandidate().getId().equals(candidate.getId())) {
            throw new RuntimeException("You are not authorized to withdraw this application");
        }

        applicationRepository.delete(application);
    }

    public boolean hasApplied(Long jobId, String candidateEmail) {
        User candidate = userRepository.findByEmail(candidateEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return applicationRepository.existsByCandidateIdAndJobId(candidate.getId(), jobId);
    }

    public Long getApplicationId(Long jobId, String candidateEmail) {
        User candidate = userRepository.findByEmail(candidateEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return applicationRepository.findByCandidateIdAndJobId(candidate.getId(), jobId)
                .map(Application::getId)
                .orElse(null);
    }
}
