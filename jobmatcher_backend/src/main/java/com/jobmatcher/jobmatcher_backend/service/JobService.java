package com.jobmatcher.jobmatcher_backend.service;

import com.jobmatcher.jobmatcher_backend.dto.JobRequest;
import com.jobmatcher.jobmatcher_backend.model.Job;
import com.jobmatcher.jobmatcher_backend.model.User;
import com.jobmatcher.jobmatcher_backend.repository.JobRepository;
import com.jobmatcher.jobmatcher_backend.repository.SkillRepository;
import com.jobmatcher.jobmatcher_backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.LocalDate;
import java.util.HashSet;

@Service
public class JobService {

    @Autowired
    private JobRepository jobRepository;

    @Autowired
    private SkillRepository skillRepository;

    @Autowired
    private UserRepository userRepository;


    public Job createJob(JobRequest jobRequest, String recruiterEmail) {

        User recruiter = userRepository.findByEmail(recruiterEmail)
                .orElseThrow(() -> new RuntimeException("Recruiter not found with email: " + recruiterEmail));

        Job job = new Job();
        job.setTitle(jobRequest.getTitle());
        job.setDescription(jobRequest.getDescription());
        job.setLocation(jobRequest.getLocation());
        job.setSalary(jobRequest.getSalary());
        job.setJobType(jobRequest.getJobType());
        job.setCompanyName(jobRequest.getCompanyName());
        job.setExperienceRequired(jobRequest.getExperienceRequired());
        job.setWorkMode(jobRequest.getWorkMode());
        job.setCreatedBy(recruiter);
        job.setPostedDate(LocalDate.now());
        job.setLastDateToApply(jobRequest.getLastDateToApply());
        
        // Convert List to Set for skills
        if (jobRequest.getSkillIds() != null && !jobRequest.getSkillIds().isEmpty()) {

            var skills = skillRepository.findAllById(jobRequest.getSkillIds());

            if (skills.size() != jobRequest.getSkillIds().size()) {
                throw new RuntimeException("Some skill IDs are invalid");
            }

            job.setSkills(new HashSet<>(skills));
        }

        return jobRepository.save(job);
    }
}
