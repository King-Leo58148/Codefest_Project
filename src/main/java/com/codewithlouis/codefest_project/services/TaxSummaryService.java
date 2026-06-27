package com.codewithlouis.codefest_project.services;

import com.codewithlouis.codefest_project.dto.TaxSummaryDto;
import com.codewithlouis.codefest_project.model.Deal;
import com.codewithlouis.codefest_project.model.User;
import com.codewithlouis.codefest_project.repository.DealRepository;
import com.codewithlouis.codefest_project.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TaxSummaryService {

    private final UserRepository userRepository;
    private final DealRepository dealRepository;

    public List<TaxSummaryDto> getTaxSummaries() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User currentUser = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<Deal> userDeals;
        if (currentUser.getRole().name().equals("OWNER")) {
            userDeals = dealRepository.findByOwnerEmail(email);
        } else if (currentUser.getRole().name().equals("INVESTOR")) {
            userDeals = dealRepository.findByInvestorEmail(email);
        } else {
            userDeals = new ArrayList<>();
            userDeals.addAll(dealRepository.findByOwnerEmail(email));
            userDeals.addAll(dealRepository.findByInvestorEmail(email));
        }

        return userDeals.stream()
                .collect(Collectors.groupingBy(deal -> deal.getCreatedAt().getYear()))
                .entrySet()
                .stream()
                .map(entry -> {
                    int year = entry.getKey();
                    List<Deal> deals = entry.getValue();
                    double totalInvested = deals.stream()
                            .mapToDouble(deal -> deal.getBid().getAmount())
                            .sum();
                    double totalReturns = deals.stream()
                            .mapToDouble(deal -> {
                                if (deal.getBid().getReturnType() == null) return 0.0;
                                switch (deal.getBid().getReturnType()) {
                                    case FIXED:
                                    case REVENUE_SHARE:
                                        return deal.getBid().getReturnValue();
                                    default:
                                        return 0.0;
                                }
                            })
                            .sum();
                    String status = deals.stream()
                            .map(Deal::getStatus)
                            .map(Enum::name)
                            .collect(Collectors.joining(", "));
                    return new TaxSummaryDto(
                            String.valueOf(year),
                            totalInvested,
                            totalReturns,
                            deals.size(),
                            status,
                            "/api/tax-summaries/download/" + year
                    );
                })
                .collect(Collectors.toList());
    }
}
