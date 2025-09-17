package com.orion.prototype.service;

import com.orion.prototype.dto.SubscriptionDto;
import com.orion.prototype.entity.Subscription;
import com.orion.prototype.entity.Topic;
import com.orion.prototype.entity.User;
import com.orion.prototype.repository.SubscriptionRepository;
import com.orion.prototype.repository.TopicRepository;
import com.orion.prototype.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
public class SubscriptionService {

    private final SubscriptionRepository subscriptionRepository;
    private final TopicRepository topicRepository;
    private final UserRepository userRepository;

    public SubscriptionService(SubscriptionRepository subscriptionRepository,
            TopicRepository topicRepository,
            UserRepository userRepository) {
        this.subscriptionRepository = subscriptionRepository;
        this.topicRepository = topicRepository;
        this.userRepository = userRepository;
    }

    // S’abonner à un topic
    public SubscriptionDto subscribe(Long topicId, Authentication authentication) {
        String email = (String) authentication.getPrincipal();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Utilisateur introuvable"));

        Topic topic = topicRepository.findById(topicId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Topic introuvable"));

        if (subscriptionRepository.findByUserAndTopicId(user, topicId).isPresent()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Déjà abonné à ce topic");
        }

        Subscription saved = subscriptionRepository.save(
                Subscription.builder().user(user).topic(topic).build());

        return toDto(saved);
    }

    // Liste mes abonnements
    public List<SubscriptionDto> getMySubscriptions(Authentication authentication) {
        String email = (String) authentication.getPrincipal();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Utilisateur introuvable"));

        return subscriptionRepository.findByUser(user).stream()
                .map(this::toDto)
                .toList();
    }

    // Se désabonner
    public void unsubscribe(Long subscriptionId, Authentication authentication) {
        String email = (String) authentication.getPrincipal();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Utilisateur introuvable"));

        Subscription sub = subscriptionRepository.findById(subscriptionId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Abonnement introuvable"));

        if (!sub.getUser().equals(user)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Vous ne pouvez pas supprimer cet abonnement");
        }

        subscriptionRepository.delete(sub);
    }

    private SubscriptionDto toDto(Subscription s) {
        return new SubscriptionDto(
                s.getId(),
                s.getTopic().getId(),
                s.getTopic().getName());
    }
}