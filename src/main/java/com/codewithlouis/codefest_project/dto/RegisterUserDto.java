package com.codewithlouis.codefest_project.dto;

import com.codewithlouis.codefest_project.model.Role;
import lombok.Data;

@Data
public class RegisterUserDto {
    private String name;
    private String email;
    private String password;
    private String confirmPassword;
    private Role role;
}