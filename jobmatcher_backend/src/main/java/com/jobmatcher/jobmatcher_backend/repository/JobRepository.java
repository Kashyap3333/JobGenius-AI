package com.jobmatcher.jobmatcher_backend.repository;

import com.jobmatcher.jobmatcher_backend.model.Job;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface JobRepository extends JpaRepository<Job, Long> {
    List<Job> findAll();
}
