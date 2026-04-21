package com.jobmatcher.jobmatcher_backend.dto;

import com.jobmatcher.jobmatcher_backend.model.User;

public class UserResponse {

    private String email;
    private String role;

    public UserResponse(User user) {
        this.email = user.getEmail();
        this.role = user.getRole().name(); // no ROLE_ here
    }

    public String getEmail() {
        return email;
    }

    public String getRole() {
        return role;
    }
}