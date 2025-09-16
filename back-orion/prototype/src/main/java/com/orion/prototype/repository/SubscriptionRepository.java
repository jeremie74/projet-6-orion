package com.orion.prototype.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.orion.prototype.entity.Subscription;
import com.orion.prototype.entity.Topic;
import com.orion.prototype.entity.User;

public interface SubscriptionRepository extends JpaRepository<Subscription, Long> {
    List<Subscription> findByUser(User user);

    List<Subscription> findByTopic(Topic topic);

    Optional<Subscription> findByUserAndTopic(User user, Topic topic);
}