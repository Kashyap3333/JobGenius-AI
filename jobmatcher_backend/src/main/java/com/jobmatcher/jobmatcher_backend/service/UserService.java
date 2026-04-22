package com.jobmatcher.jobmatcher_backend.service;

import com.jobmatcher.jobmatcher_backend.dto.UserResponse;
import com.jobmatcher.jobmatcher_backend.dto.UserUpdateRequest;
import com.jobmatcher.jobmatcher_backend.model.User;
import com.jobmatcher.jobmatcher_backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class UserService {
    
    @Autowired
    private UserRepository userRepository;


    public UserResponse updateCurrentUser(String email, UserUpdateRequest updatedInfo) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!user.getEmail().equals(updatedInfo.getEmail()) &&
                userRepository.findByEmail(updatedInfo.getEmail()).isPresent()) {
            throw new RuntimeException("Email already in use");
        }
        user.setUsername(updatedInfo.getUsername());
        user.setEmail(updatedInfo.getEmail());


        return new UserResponse(userRepository.save(user));

    }
}


