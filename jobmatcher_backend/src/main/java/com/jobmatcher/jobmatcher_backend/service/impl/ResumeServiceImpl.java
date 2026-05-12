package com.jobmatcher.jobmatcher_backend.service.impl;

import com.jobmatcher.jobmatcher_backend.dto.ResumeResponse;
import com.jobmatcher.jobmatcher_backend.model.User;
import com.jobmatcher.jobmatcher_backend.repository.UserRepository;
import com.jobmatcher.jobmatcher_backend.service.ResumeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
public class    ResumeServiceImpl implements ResumeService {

    private static final long MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
    private static final List<String> ALLOWED_CONTENT_TYPES = List.of(
            "application/pdf",
            "application/msword",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    );
    private static final List<String> ALLOWED_EXTENSIONS = List.of(".pdf", ".doc", ".docx");

    @Value("${file.upload-dir:uploads/resumes}")
    private String uploadDir;

    @Value("${app.base-url:http://localhost:8080}")
    private String baseUrl;

    @Autowired
    private UserRepository userRepository;

    @Override
    public ResumeResponse uploadResume(MultipartFile file, String candidateEmail) {
        validateFile(file);

        User candidate = userRepository.findByEmail(candidateEmail)
                .orElseThrow(() -> new RuntimeException("Candidate not found with email: " + candidateEmail));

        // Delete old resume file from disk if exists
        if (candidate.getResumeFileName() != null) {
            deleteFileFromDisk(candidate.getResumeFileName());
        }

        String savedFileName = storeFile(file);

        candidate.setResumeFileName(savedFileName);
        candidate.setResumeUrl(baseUrl + "/uploads/resumes/" + savedFileName);
        candidate.setResumeUploadedAt(LocalDateTime.now());

        userRepository.save(candidate);

        return new ResumeResponse(candidate);
    }

    @Override
    public ResumeResponse getResume(Long candidateId) {
        User candidate = userRepository.findById(candidateId)
                .orElseThrow(() -> new RuntimeException("Candidate not found with id: " + candidateId));

        if (candidate.getResumeFileName() == null) {
            throw new RuntimeException("No resume found for candidate with id: " + candidateId);
        }

        return new ResumeResponse(candidate);
    }

    @Override
    public void deleteResume(Long candidateId, String candidateEmail) {
        User candidate = userRepository.findById(candidateId)
                .orElseThrow(() -> new RuntimeException("Candidate not found with id: " + candidateId));

        if (!candidate.getEmail().equals(candidateEmail)) {
            throw new RuntimeException("Unauthorized: You can only delete your own resume");
        }

        if (candidate.getResumeFileName() == null) {
            throw new RuntimeException("No resume found for candidate with id: " + candidateId);
        }

        deleteFileFromDisk(candidate.getResumeFileName());

        candidate.setResumeFileName(null);
        candidate.setResumeUrl(null);
        candidate.setResumeUploadedAt(null);

        userRepository.save(candidate);
    }

    // ── Private helpers ────────────────────────────────────────

    private void validateFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new RuntimeException("File must not be empty");
        }

        if (file.getSize() > MAX_FILE_SIZE) {
            throw new RuntimeException("File size exceeds maximum allowed limit of 5MB");
        }

        String contentType = file.getContentType();
        if (contentType == null || !ALLOWED_CONTENT_TYPES.contains(contentType)) {
            throw new RuntimeException("Invalid file type. Only PDF, DOC, and DOCX files are allowed");
        }

        String originalName = file.getOriginalFilename();
        if (originalName == null || originalName.isBlank()) {
            throw new RuntimeException("File name must not be empty");
        }

        String lowerName = originalName.toLowerCase();
        boolean hasValidExtension = ALLOWED_EXTENSIONS.stream().anyMatch(lowerName::endsWith);
        if (!hasValidExtension) {
            throw new RuntimeException("Invalid file extension. Only .pdf, .doc, .docx are allowed");
        }
    }

    private String storeFile(MultipartFile file) {
        try {
            Path uploadPath = Paths.get(uploadDir).toAbsolutePath().normalize();
            Files.createDirectories(uploadPath);

            String originalName = file.getOriginalFilename();
            String extension = originalName.substring(originalName.lastIndexOf('.'));
            String uniqueFileName = UUID.randomUUID() + extension;

            Path targetPath = uploadPath.resolve(uniqueFileName);
            Files.copy(file.getInputStream(), targetPath, StandardCopyOption.REPLACE_EXISTING);

            return uniqueFileName;
        } catch (IOException ex) {
            throw new RuntimeException("Failed to store file. Please try again: " + ex.getMessage());
        }
    }

    private void deleteFileFromDisk(String fileName) {
        try {
            Path filePath = Paths.get(uploadDir).toAbsolutePath().normalize().resolve(fileName);
            Files.deleteIfExists(filePath);
        } catch (IOException ex) {
            // Log but don't block — old file cleanup is non-critical
        }
    }
}
