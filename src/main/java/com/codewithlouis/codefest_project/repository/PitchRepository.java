package com.codewithlouis.codefest_project.repository;


import com.codewithlouis.codefest_project.model.Pitch;
import com.codewithlouis.codefest_project.model.PitchStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PitchRepository extends JpaRepository<Pitch, Integer> {
    List<Pitch> findByStatus(PitchStatus status);
    List<Pitch> findByOwnerEmail(String email);
}