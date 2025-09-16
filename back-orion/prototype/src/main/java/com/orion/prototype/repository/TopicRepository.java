package com.orion.prototype.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.orion.prototype.entity.Topic;

public interface TopicRepository extends JpaRepository<Topic, Long> {
    Optional<Topic> findByName(String name);
}