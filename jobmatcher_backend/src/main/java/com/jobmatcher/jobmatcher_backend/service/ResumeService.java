package com.jobmatcher.jobmatcher_backend.service;

import com.jobmatcher.jobmatcher_backend.dto.ResumeResponse;
import org.springframework.web.multipart.MultipartFile;

public interface ResumeService {

    ResumeResponse uploadResume(MultipartFile file, String candidateEmail);

    ResumeResponse getResume(Long candidateId);

    void deleteResume(Long candidateId, String candidateEmail);
}
