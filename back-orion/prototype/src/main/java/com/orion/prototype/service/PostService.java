package com.orion.prototype.service;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.orion.prototype.dto.CommentDto;
import com.orion.prototype.dto.PostDto;
import com.orion.prototype.entity.Post;
import com.orion.prototype.entity.Topic;
import com.orion.prototype.entity.User;
import com.orion.prototype.repository.PostRepository;
import com.orion.prototype.repository.TopicRepository;
import com.orion.prototype.repository.UserRepository;

@Service
public class PostService {

        private final PostRepository postRepository;
        private final TopicRepository topicRepository;
        private final UserRepository userRepository;

        public PostService(PostRepository postRepository,
                        TopicRepository topicRepository,
                        UserRepository userRepository) {
                this.postRepository = postRepository;
                this.topicRepository = topicRepository;
                this.userRepository = userRepository;
        }

        // Create a new post
        public PostDto createPost(String title, String content, Long topicId, String authorEmail) {
                Topic topic = topicRepository.findById(topicId)
                                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                                                "Topic introuvable"));

                User author = userRepository.findByEmail(authorEmail)
                                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                                                "Auteur introuvable"));

                Post post = new Post();
                post.setTitle(title);
                post.setContent(content);
                post.setCreatedAt(LocalDateTime.now());
                post.setTopic(topic);
                post.setAuthor(author);

                Post saved = postRepository.save(post);
                return toDto(saved);
        }

        // Get all posts (as DTOs)
        public List<PostDto> getAllPosts() {
                return postRepository.findAllByOrderByCreatedAtDesc()
                                .stream()
                                .map(this::toDto)
                                .toList();
        }

        // Get a post by id
        public PostDto getPostById(Long id) {
                Post post = postRepository.findById(id)
                                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                                                "Article introuvable"));
                return toDto(post);
        }

        // Conversion Post -> PostDto
        private PostDto toDto(Post post) {
                return new PostDto(
                                post.getId(),
                                post.getTitle(),
                                post.getContent(),
                                post.getCreatedAt(),
                                post.getTopic().getName(),
                                post.getAuthor().getUsername(),
                                post.getComments().stream()
                                                .map(c -> new CommentDto(
                                                                c.getId(),
                                                                c.getContent(),
                                                                c.getCreatedAt(),
                                                                c.getAuthor().getUsername()))
                                                .toList());
        }
}