package com.jobmatcher.jobmatcher_backend.dto;

import com.jobmatcher.jobmatcher_backend.model.User;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ResumeResponse {

    private Long candidateId;
    private String candidateName;
    private String resumeFileName;
    private String resumeUrl;
    private LocalDateTime resumeUploadedAt;

    public ResumeResponse(User user) {
        this.candidateId = user.getId();
        this.candidateName = user.getUsername();
        this.resumeFileName = user.getResumeFileName();
        this.resumeUrl = user.getResumeUrl();
        this.resumeUploadedAt = user.getResumeUploadedAt();
    }
}
