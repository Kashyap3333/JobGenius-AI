package com.jobmatcher.jobmatcher_backend.dto;

import com.jobmatcher.jobmatcher_backend.enums.JobType;
import com.jobmatcher.jobmatcher_backend.enums.WorkMode;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;
import java.util.List;

@Data
public class JobRequest {

    @NotBlank(message = "Title is required")
    private String title;
    private String description;
    private JobType jobType;
    private String location;
    @NotBlank(message = "Company name is required")
    private String companyName;
    private String experienceRequired;
    @Enumerated(EnumType.STRING)
    private WorkMode workMode;
    @Min(0)
    private Integer salary;
    private List<Long> skillIds;
    @Future
    @NotNull(message = "Last date to apply is required and must be in the future")
    private LocalDate lastDateToApply;
    


}