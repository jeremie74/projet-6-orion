package com.orion.prototype.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.orion.prototype.entity.Comment;
import com.orion.prototype.entity.Post;
import com.orion.prototype.entity.User;

public interface CommentRepository extends JpaRepository<Comment, Long> {
    List<Comment> findByAuthor(User author);

    List<Comment> findByPost(Post post);
}