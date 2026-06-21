package com.codewithlouis.codefest_project.scheduler;


import com.codewithlouis.codefest_project.model.Pitch;
import com.codewithlouis.codefest_project.model.PitchStatus;
import com.codewithlouis.codefest_project.repository.PitchRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class PitchExpiryScheduler {

    private final PitchRepository pitchRepository;

    // Runs every day at midnight
    @Scheduled(cron = "0 0 0 * * *")
    public void expireOldPitches() {
        List<Pitch> expiredPitches = pitchRepository
                .findByStatusAndExpiresAtBefore(PitchStatus.LIVE, LocalDateTime.now());

        for (Pitch pitch : expiredPitches) {
            pitch.setStatus(PitchStatus.EXPIRED);
            pitchRepository.save(pitch);
            log.info("Pitch {} expired: {}", pitch.getId(), pitch.getBusinessName());
        }
    }
}