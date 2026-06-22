package com.codewithlouis.codefest_project.request;


import com.codewithlouis.codefest_project.model.OfferType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class PitchRequest {

    @NotBlank
    private String businessName;

    @NotBlank
    private String description;

    @NotNull
    private Double monthlyIncome;

    @NotNull
    private Double amountNeeded;

    @NotNull
    private String offerType;

    private Double offerValue;

    private String location;

    @NotBlank
    private String industry;

    // ❌ NO videoUrl here
}