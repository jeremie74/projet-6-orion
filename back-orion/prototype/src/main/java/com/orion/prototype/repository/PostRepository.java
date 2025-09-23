package com.orion.prototype.repository;

import java.util.List;

import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.repository.JpaRepository;

import com.orion.prototype.entity.Post;

public interface PostRepository extends JpaRepository<Post, Long> {
    List<Post> findAllByOrderByCreatedAtDesc();

    List<Post> findAllByAuthorIdOrderByCreatedAtDesc(Long authorId);

    List<Post> findAllByAuthorId(Long authorId, Sort sort);

    List<Post> findAllByTopicId(Long topicId, Sort sort);
}
