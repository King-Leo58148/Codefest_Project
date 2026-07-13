package com.codewithlouis.codefest_project.dto;

import lombok.Data;

@Data
public class ProfileUpdateRequest {
    private String name;
    private String currentPassword;
    private String newPassword;
    private String confirmPassword;
    private String momoNumber;
}
