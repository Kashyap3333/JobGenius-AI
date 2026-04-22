package com.jobmatcher.jobmatcher_backend.dto;

import com.jobmatcher.jobmatcher_backend.model.User;
import lombok.Getter;

@Getter
public class UserResponse {

    private final Long id;
    private final String username;
    private final String email;
    private final String role;

    public UserResponse(User user) {
        this.id = user.getId();
        this.username = user.getUsername();
        this.email = user.getEmail();
        this.role = user.getRole().name();
    }
}