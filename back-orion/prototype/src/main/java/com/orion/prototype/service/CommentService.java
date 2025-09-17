package com.orion.prototype.service;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.orion.prototype.dto.CommentDto;
import com.orion.prototype.entity.Comment;
import com.orion.prototype.entity.Post;
import com.orion.prototype.entity.User;
import com.orion.prototype.repository.CommentRepository;
import com.orion.prototype.repository.PostRepository;
import com.orion.prototype.repository.UserRepository;

@Service
public class CommentService {

    private final CommentRepository commentRepository;
    private final PostRepository postRepository;
    private final UserRepository userRepository;

    public CommentService(CommentRepository commentRepository,
            PostRepository postRepository,
            UserRepository userRepository) {
        this.commentRepository = commentRepository;
        this.postRepository = postRepository;
        this.userRepository = userRepository;
    }

    // ADD a comment to a post
    public CommentDto addComment(Long postId, String content, Authentication authentication) {
        String email = (String) authentication.getPrincipal();
        User author = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Auteur introuvable"));

        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Article introuvable"));

        Comment comment = Comment.builder()
                .content(content)
                .author(author)
                .post(post)
                .build();

        Comment saved = commentRepository.save(comment);

        return toDto(saved);
    }

    // Get comments by post
    public List<CommentDto> getCommentsByPost(Long postId) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Article introuvable"));

        return commentRepository.findByPost(post).stream()
                .map(this::toDto)
                .toList();
    }

    // Conversion -> DTO
    private CommentDto toDto(Comment comment) {
        return new CommentDto(
                comment.getId(),
                comment.getContent(),
                comment.getCreatedAt(),
                comment.getAuthor().getUsername());
    }
}