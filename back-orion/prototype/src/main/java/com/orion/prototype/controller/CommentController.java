package com.orion.prototype.controller;

import java.util.List;
import java.util.Map;

import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.orion.prototype.dto.CommentDto;
import com.orion.prototype.service.CommentService;

@RestController
@RequestMapping("/api/comments")
public class CommentController {

    private final CommentService commentService;

    public CommentController(CommentService commentService) {
        this.commentService = commentService;
    }

    // POST /api/comments -> add a comment to a post
    @PostMapping
    public CommentDto addComment(@RequestBody Map<String, String> payload,
            Authentication authentication) {
        Long postId = Long.valueOf(payload.get("postId"));
        String content = payload.get("content");
        return commentService.addComment(postId, content, authentication);
    }

    // GET /api/comments/post/{postId} -> get comments by post
    @GetMapping("/post/{postId}")
    public List<CommentDto> getCommentsByPost(@PathVariable Long postId) {
        return commentService.getCommentsByPost(postId);
    }
}