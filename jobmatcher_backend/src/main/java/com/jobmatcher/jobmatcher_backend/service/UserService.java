package com.jobmatcher.jobmatcher_backend.service;

import com.jobmatcher.jobmatcher_backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class UserService {
    
    @Autowired
    private UserRepository userRepository;
    

}


