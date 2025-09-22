package com.orion.prototype.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
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

        private static final Map<String, String> SORT_FIELDS = Map.of(
                        "createdAt", "createdAt",
                        "title", "title",
                        "author", "author.username");

        private static final Map<String, Sort.Direction> DEFAULT_SORT_DIRECTIONS = Map.of(
                        "createdAt", Sort.Direction.DESC,
                        "title", Sort.Direction.ASC,
                        "author", Sort.Direction.ASC);

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

        @Transactional
        public PostDto updatePost(Long postId, String title, String content, Long topicId, String authorEmail) {
                Post post = postRepository.findById(postId)
                                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                                                "Article introuvable"));

                User currentUser = userRepository.findByEmail(authorEmail)
                                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED,
                                                "Utilisateur introuvable"));

                if (!post.getAuthor().getId().equals(currentUser.getId())) {
                        throw new ResponseStatusException(HttpStatus.FORBIDDEN,
                                        "Vous ne pouvez pas modifier cet article");
                }

                Topic topic = topicRepository.findById(topicId)
                                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                                                "Topic introuvable"));

                post.setTitle(title);
                post.setContent(content);
                post.setTopic(topic);

                postRepository.save(post);

                return toDto(post);
        }

        @Transactional
        public void deletePost(Long postId, String authorEmail) {
                Post post = postRepository.findById(postId)
                                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                                                "Article introuvable"));

                User currentUser = userRepository.findByEmail(authorEmail)
                                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED,
                                                "Utilisateur introuvable"));

                if (!post.getAuthor().getId().equals(currentUser.getId())) {
                        throw new ResponseStatusException(HttpStatus.FORBIDDEN,
                                        "Vous ne pouvez pas supprimer cet article");
                }

                postRepository.delete(post);
        }

        // Get all posts (as DTOs)
        public List<PostDto> getAllPosts() {
                return postRepository.findAllByOrderByCreatedAtDesc()
                                .stream()
                                .map(this::toDto)
                                .toList();
        }

        // Get posts belonging to a specific author
        public List<PostDto> getPostsByAuthorId(Long authorId, String sortField, String order) {
                Sort sort = buildSort(sortField, order);

                return postRepository.findAllByAuthorId(authorId, sort)
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
        private Sort buildSort(String sortField, String order) {
                String property = SORT_FIELDS.get(sortField);
                if (property == null) {
                        throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                                        "Critère de tri invalide: " + sortField);
                }

                String sanitizedOrder = order == null ? null : order.trim();

                Sort.Direction direction;
                if (sanitizedOrder == null || sanitizedOrder.isEmpty()) {
                        direction = DEFAULT_SORT_DIRECTIONS.getOrDefault(sortField, Sort.Direction.ASC);
                } else {
                        try {
                                direction = Sort.Direction.fromString(sanitizedOrder);
                        } catch (IllegalArgumentException ex) {
                                throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                                                "Ordre de tri invalide: " + order);
                        }
                }

                Sort.Order sortOrder = new Sort.Order(direction, property);
                if ("title".equals(property) || "author.username".equals(property)) {
                        sortOrder = sortOrder.ignoreCase();
                }

                return Sort.by(sortOrder);
        }

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
