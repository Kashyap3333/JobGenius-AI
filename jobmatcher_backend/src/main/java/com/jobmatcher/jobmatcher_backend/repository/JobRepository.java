package com.jobmatcher.jobmatcher_backend.repository;

import com.jobmatcher.jobmatcher_backend.model.Job;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface JobRepository extends JpaRepository<Job, Long> {
    List<Job> findAll();

    @Query("SELECT j FROM Job j WHERE j.createdBy.email = :email")
    List<Job> findByRecruiterEmail(@Param("email") String email);
}
