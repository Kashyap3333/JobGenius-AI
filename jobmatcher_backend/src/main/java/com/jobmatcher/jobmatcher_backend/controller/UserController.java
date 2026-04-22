package com.jobmatcher.jobmatcher_backend.controller;

import com.jobmatcher.jobmatcher_backend.dto.UserResponse;
import com.jobmatcher.jobmatcher_backend.dto.UserUpdateRequest;
import com.jobmatcher.jobmatcher_backend.model.User;
import com.jobmatcher.jobmatcher_backend.repository.UserRepository;
import com.jobmatcher.jobmatcher_backend.service.UserService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;


@RestController
@RequestMapping("/users")
public class UserController {

    @Autowired
    UserRepository userRepository;

    @Autowired
    UserService userService;

    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser(Authentication authentication) {

        String email = authentication.getName();

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return ResponseEntity.ok(new UserResponse(user));
    }

    @PutMapping("/me")
    public ResponseEntity<UserResponse> updateCurrentUser(@Valid Authentication authentication, @RequestBody UserUpdateRequest updatedInfo) {

        String email = authentication.getName();

        UserResponse userResponse = userService.updateCurrentUser(email, updatedInfo);

        return ResponseEntity.ok(userResponse);



    }
}
