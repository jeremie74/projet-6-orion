package com.orion.prototype.controller;

import java.util.List;
import java.util.Map;

import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.orion.prototype.dto.SubscriptionDto;
import com.orion.prototype.service.SubscriptionService;

@RestController
@RequestMapping("/api/subscriptions")
public class SubscriptionController {

    private final SubscriptionService subscriptionService;

    public SubscriptionController(SubscriptionService subscriptionService) {
        this.subscriptionService = subscriptionService;
    }

    @PostMapping
    public SubscriptionDto subscribe(@RequestBody Map<String, String> payload,
            Authentication authentication) {
        Long topicId = Long.valueOf(payload.get("topicId"));
        return subscriptionService.subscribe(topicId, authentication);
    }

    @GetMapping("/me")
    public List<SubscriptionDto> getMySubscriptions(Authentication authentication) {
        return subscriptionService.getMySubscriptions(authentication);
    }

    @DeleteMapping("/{id}")
    public void unsubscribe(@PathVariable Long id, Authentication authentication) {
        subscriptionService.unsubscribe(id, authentication);
    }
}