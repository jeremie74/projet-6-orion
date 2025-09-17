package com.orion.prototype.repository;

import com.orion.prototype.entity.Subscription;
import com.orion.prototype.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface SubscriptionRepository extends JpaRepository<Subscription, Long> {
    List<Subscription> findByUser(User user);
    Optional<Subscription> findByUserAndTopicId(User user, Long topicId);
}