package com.backend.cityfix.service;

import com.backend.cityfix.model.Role;
import com.backend.cityfix.repository.RoleRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class RoleService {

    private final RoleRepository repository;

    public RoleService(RoleRepository repository) {
        this.repository = repository;
    }

    public List<Role> getAll() {
        return repository.findAll();
    }

    public Optional<Role> getById(Long id) {
        return repository.findById(id);
    }

    public Role save(Role role) {
        return repository.save(role);
    }

    public void delete(Long id) {
        repository.deleteById(id);
    }
}
