package com.jobmatcher.jobmatcher_backend.dto;

import com.jobmatcher.jobmatcher_backend.model.Job;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class JobResponse {
    private Long id;
    private String title;
    private String description;
    private String companyName;
    private String location;
    private String jobType;
    private String workMode;
    private Integer salary;
    private String experienceRequired;

    private LocalDate postedDate;
    private LocalDate lastDateToApply;
    private Long recruiterId; // 👈 only this instead of full user

    public JobResponse(Job job) {
        this.id = job.getId();
        this.title = job.getTitle();
        this.companyName = job.getCompanyName();
        this.location = job.getLocation();
        this.jobType = job.getJobType().name();
        this.workMode = job.getWorkMode().name();
        this.salary = job.getSalary();
        this.experienceRequired = job.getExperienceRequired();
        this.postedDate = job.getPostedDate();
        this.lastDateToApply = job.getLastDateToApply();

        this.recruiterId = job.getCreatedBy().getId(); // 🔥 key
    }

}
