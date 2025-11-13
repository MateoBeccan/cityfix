package com.backend.cityfix.service;

import com.backend.cityfix.model.Status;
import com.backend.cityfix.repository.StatusRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class StatusService {

    private final StatusRepository repository;

    public StatusService(StatusRepository repository) {
        this.repository = repository;
    }

    public List<Status> getAll() {
        return repository.findAll();
    }

    public Optional<Status> getById(Long id) {
        return repository.findById(id);
    }

    public Status save(Status status) {
        return repository.save(status);
    }

    public void delete(Long id) {
        repository.deleteById(id);
    }
}