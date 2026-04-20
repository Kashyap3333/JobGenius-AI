package com.jobmatcher.jobmatcher_backend.controller;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/users")
public class UserController {


    @GetMapping("/me")
    public Map<String, Object> getCurrentUser() {

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();

        String role = auth.getAuthorities().stream()
                .findFirst()
                .map(a -> a.getAuthority())
                .orElse("UNKNOWN");

        return Map.of(
                "email", auth.getName(),
                "role", role
        );
    }
}
