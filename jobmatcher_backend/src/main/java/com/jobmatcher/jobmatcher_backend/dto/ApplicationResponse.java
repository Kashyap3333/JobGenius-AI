package com.jobmatcher.jobmatcher_backend.dto;

import com.jobmatcher.jobmatcher_backend.model.Application;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ApplicationResponse {

    private Long id;
    private Long jobId;
    private String jobTitle;
    private String companyName;
    private String location;
    private String jobType;
    private Long candidateId;
    private String candidateName;
    private String candidateEmail;
    private String status;
    private LocalDateTime appliedAt;
    private String coverLetter;
    private Long selectedResumeId;
    private String selectedResumeFileName;
    private String selectedResumeUrl;

    public ApplicationResponse(Application application) {
        this.id = application.getId();
        this.jobId = application.getJob().getId();
        this.jobTitle = application.getJob().getTitle();
        this.companyName = application.getJob().getCompanyName();
        this.location = application.getJob().getLocation();
        this.jobType = application.getJob().getJobType() != null
                ? application.getJob().getJobType().name() : null;
        this.candidateId = application.getCandidate().getId();
        this.candidateName = application.getCandidate().getUsername();
        this.candidateEmail = application.getCandidate().getEmail();
        this.status = application.getStatus().name();
        this.appliedAt = application.getAppliedAt();
        this.coverLetter = application.getCoverLetter();
        if (application.getSelectedResume() != null) {
            this.selectedResumeId = application.getSelectedResume().getId();
            this.selectedResumeFileName = application.getSelectedResume().getOriginalFileName();
            this.selectedResumeUrl = application.getSelectedResume().getResumeUrl();
        }
    }
}
