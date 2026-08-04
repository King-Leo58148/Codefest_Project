package com.codewithlouis.codefest_project.configs;

import org.springframework.cache.CacheManager;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.cache.concurrent.ConcurrentMapCacheManager;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
@EnableCaching
public class CacheConfiguration {

    @Bean
    public CacheManager cacheManager() {
        // Only admin-facing read caches remain — these are low-frequency,
        // admin-only views where slight staleness is acceptable.
        // Real-time caches (deals, repayments, live pitches) were removed.
        return new ConcurrentMapCacheManager(
                "allUsers" // admin: user list (evicted on suspend/unsuspend)
        );
    }
}
