package com.orion.prototype.controller;

import java.util.List;
import java.util.Map;

import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import com.orion.prototype.dto.PostDto;
import com.orion.prototype.service.PostService;

@RestController
@RequestMapping("/api/posts")
public class PostController {

    private final PostService postService;

    public PostController(PostService postService) {
        this.postService = postService;
    }

    @GetMapping
    public List<PostDto> getAllPosts() {
        return postService.getAllPosts();
    }

    @GetMapping("/user/{userId}")
    public List<PostDto> getPostsByUserId(
            @PathVariable Long userId,
            @RequestParam(name = "sort", defaultValue = "createdAt") String sort,
            @RequestParam(name = "order", required = false) String order) {
        return postService.getPostsByAuthorId(userId, sort, order);
    }

    @GetMapping("/topic/{topicId}")
    public List<PostDto> getPostsByTopicId(
            @PathVariable Long topicId,
            @RequestParam(name = "sort", defaultValue = "createdAt") String sort,
            @RequestParam(name = "order", required = false) String order) {
        return postService.getPostsByTopicId(topicId, sort, order);
    }

    @GetMapping("/{id}")
    public PostDto getPostById(@PathVariable Long id) {
        return postService.getPostById(id);
    }

    @PostMapping
    public PostDto createPost(@RequestBody Map<String, String> payload,
            Authentication authentication) {
        String title = payload.get("title");
        String content = payload.get("content");
        Long topicId = Long.valueOf(payload.get("topicId"));

        String authorEmail = (String) authentication.getPrincipal();

        return postService.createPost(title, content, topicId, authorEmail);
    }

    @PutMapping("/{id}")
    public PostDto updatePost(
            @PathVariable Long id,
            @RequestBody Map<String, String> payload,
            Authentication authentication) {

        String title = payload.get("title");
        String content = payload.get("content");
        String topicIdValue = payload.get("topicId");

        if (title == null || content == null || topicIdValue == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Les champs title, content et topicId sont requis");
        }

        Long topicId;
        try {
            topicId = Long.valueOf(topicIdValue);
        } catch (NumberFormatException ex) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Le champ topicId doit être un nombre");
        }
        String authorEmail = (String) authentication.getPrincipal();

        return postService.updatePost(id, title, content, topicId, authorEmail);
    }

    @DeleteMapping("/{id}")
    public void deletePost(
            @PathVariable Long id,
            Authentication authentication) {
        String authorEmail = (String) authentication.getPrincipal();
        postService.deletePost(id, authorEmail);
    }
}
