package com.codewithlouis.codefest_project.request;


import com.codewithlouis.codefest_project.model.OfferType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class PitchRequest {

    @NotBlank(message = "Business name is required")
    private String businessName;

    @NotBlank(message = "Description is required")
    private String description;

    @NotBlank(message = "A pitch video is required")
    private String videoUrl;

    @NotNull(message = "Monthly income is required")
    private Double monthlyIncome;

    @NotNull(message = "Amount needed is required")
    private Double amountNeeded;

    @NotNull(message = "Offer type is required")
    private OfferType offerType;

    private Double offerValue;

    private String location;

    private String industry;


}