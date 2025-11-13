package com.backend.cityfix.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.web.servlet.HandlerInterceptor;

import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;

@Configuration
public class RateLimitConfig implements WebMvcConfigurer {

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(new RateLimitInterceptor())
                .addPathPatterns("/api/**");
    }

    public static class RateLimitInterceptor implements HandlerInterceptor {
        private final ConcurrentHashMap<String, AtomicInteger> requestCounts = new ConcurrentHashMap<>();
        private final ConcurrentHashMap<String, Long> requestTimes = new ConcurrentHashMap<>();
        private static final int MAX_REQUESTS = 100; // 100 requests per minute
        private static final long TIME_WINDOW = 60000; // 1 minute

        @Override
        public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
            String clientIp = getClientIp(request);
            long currentTime = System.currentTimeMillis();
            
            // Reset counter if time window has passed
            Long lastRequestTime = requestTimes.get(clientIp);
            if (lastRequestTime == null || (currentTime - lastRequestTime) > TIME_WINDOW) {
                requestCounts.put(clientIp, new AtomicInteger(1));
                requestTimes.put(clientIp, currentTime);
                return true;
            }
            
            // Check if limit exceeded
            AtomicInteger count = requestCounts.get(clientIp);
            if (count != null && count.incrementAndGet() > MAX_REQUESTS) {
                response.setStatus(429); // Too Many Requests
                response.getWriter().write("{\"error\":\"Rate limit exceeded\"}");
                return false;
            }
            
            return true;
        }
        
        private String getClientIp(HttpServletRequest request) {
            String xForwardedFor = request.getHeader("X-Forwarded-For");
            if (xForwardedFor != null && !xForwardedFor.isEmpty()) {
                return xForwardedFor.split(",")[0].trim();
            }
            return request.getRemoteAddr();
        }
    }
}