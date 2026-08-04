package com.codewithlouis.codefest_project.configs;

import org.springframework.cache.CacheManager;
import org.springframework.cache.support.NoOpCacheManager;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Application caching is intentionally disabled.
 *
 * The admin views (pitch review queue, user list, deals, repayments) all have to
 * reflect the current database state the moment something changes — a business
 * owner submitting a pitch expects it in the review queue immediately. The
 * previous ConcurrentMapCacheManager served those reads from an in-process map,
 * which also meant the caches were per-instance and would go stale if more than
 * one replica was ever running.
 *
 * A NoOpCacheManager is used rather than deleting this class so that any
 * @Cacheable/@CacheEvict added later degrades to a harmless no-op instead of
 * failing at runtime with "Cannot find cache named ...".
 */
@Configuration
public class CacheConfiguration {

    @Bean
    public CacheManager cacheManager() {
        return new NoOpCacheManager();
    }
}
