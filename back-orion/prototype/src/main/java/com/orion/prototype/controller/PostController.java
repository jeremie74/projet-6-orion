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

import com.orion.prototype.dto.PostDto;
import com.orion.prototype.service.PostService;

@RestController
@RequestMapping("/api/posts")
public class PostController {

    private final PostService postService;

    public PostController(PostService postService) {
        this.postService = postService;
    }

    // GET /api/posts -> liste des articles
    @GetMapping
    public List<PostDto> getAllPosts() {
        return postService.getAllPosts();
    }

    // GET /api/posts/{id} -> consulter un article
    @GetMapping("/{id}")
    public PostDto getPostById(@PathVariable Long id) {
        return postService.getPostById(id);
    }

    // POST /api/posts -> créer un article
    @PostMapping
    public PostDto createPost(@RequestBody Map<String, String> payload,
            Authentication authentication) {
        String title = payload.get("title");
        String content = payload.get("content");
        Long topicId = Long.valueOf(payload.get("topicId"));

        String authorEmail = (String) authentication.getPrincipal();

        return postService.createPost(title, content, topicId, authorEmail);
    }
}