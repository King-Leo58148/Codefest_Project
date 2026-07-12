package com.codewithlouis.codefest_project.repository;

import com.codewithlouis.codefest_project.model.VerificationCode;
import com.codewithlouis.codefest_project.model.VerificationPurpose;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface VerificationCodeRepository extends JpaRepository<VerificationCode, Long> {
    List<VerificationCode> findByEmailAndPurposeAndConsumedAtIsNullOrderByCreatedAtDesc(
            String email,
            VerificationPurpose purpose
    );
}
