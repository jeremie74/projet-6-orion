package com.orion.prototype.service;

import java.util.List;

import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import com.orion.prototype.dto.TopicDto;
import com.orion.prototype.entity.Topic;
import com.orion.prototype.repository.TopicRepository;

@Service
public class TopicService {

    private final TopicRepository topicRepository;

    public TopicService(TopicRepository topicRepository) {
        this.topicRepository = topicRepository;
    }

    public List<TopicDto> getAllTopics() {
        return topicRepository.findAll(Sort.by(Sort.Direction.ASC, "name")).stream()
                .map(this::toDto)
                .toList();
    }

    private TopicDto toDto(Topic topic) {
        return new TopicDto(topic.getId(), topic.getDescription(), topic.getName());
    }
}
