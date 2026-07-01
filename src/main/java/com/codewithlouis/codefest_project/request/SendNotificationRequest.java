package com.codewithlouis.codefest_project.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class SendNotificationRequest {

    private String target;
    private String email;
    private String title;

    @NotBlank
    private String message;
}
