package com.codewithlouis.codefest_project.dto;

import lombok.Data;

@Data
public class RegisterUserDto {
    private String name;
    private String email;
    private String password;
    private String confirmPassword;


}
