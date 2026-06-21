package com.codewithlouis.codefest_project.request;

import com.codewithlouis.codefest_project.model.ReturnType;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class BidRequest {

    @NotNull(message = "Amount is required")
    private Double amount;

    @NotNull(message = "Return type is required")
    private ReturnType returnType;

    private Double returnValue;

    private Integer timelineMonths;

    private String note;
}