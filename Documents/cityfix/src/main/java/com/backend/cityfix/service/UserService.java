package com.backend.cityfix.service;

import com.backend.cityfix.controller.UserController;
import com.backend.cityfix.model.Role;
import com.backend.cityfix.model.User;
import com.backend.cityfix.repository.RoleRepository;
import com.backend.cityfix.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class UserService {

    private final UserRepository repository;
    private final RoleRepository roleRepository;

    public UserService(UserRepository repository, RoleRepository roleRepository) {
        this.repository = repository;
        this.roleRepository = roleRepository;
    }

    public List<User> getAll() {
        return repository.findAll();
    }

    public Optional<User> getById(Long id) {
        return repository.findById(id);
    }

    public Optional<User> getByEmail(String email) {
        return repository.findByEmail(email);
    }

    public User save(User user) {
        return repository.save(user);
    }

    public void delete(Long id) {
        repository.deleteById(id);
    }
    
    public User createUserWithRole(UserController.CreateUserRequest request, PasswordEncoder passwordEncoder) {
        // Validaciones de entrada
        if (request == null) {
            throw new IllegalArgumentException("La solicitud no puede ser nula");
        }
        
        String email = sanitizeEmail(request.getEmail());
        String nombre = sanitizeString(request.getNombre());
        String password = request.getPassword();
        String roleName = sanitizeString(request.getRoleName());
        
        // Validaciones adicionales
        validateEmail(email);
        validatePassword(password);
        validateName(nombre);
        
        // Verificar si el email ya existe
        if (repository.findByEmail(email).isPresent()) {
            throw new RuntimeException("El email ya está registrado");
        }
        
        // Buscar el rol
        Role role = roleRepository.findByNombre(roleName)
                .orElseThrow(() -> new RuntimeException("Rol no encontrado: " + roleName));
        
        // Crear usuario
        User user = User.builder()
                .nombre(nombre)
                .email(email)
                .password(passwordEncoder.encode(password))
                .role(role)
                .build();
        
        return repository.save(user);
    }
    
    private String sanitizeString(String input) {
        if (input == null) return null;
        return input.trim().replaceAll("[<>\"'&]", "");
    }
    
    private String sanitizeEmail(String email) {
        if (email == null) return null;
        return email.trim().toLowerCase();
    }
    
    private void validateEmail(String email) {
        if (email == null || email.isEmpty()) {
            throw new IllegalArgumentException("El email es obligatorio");
        }
        if (!email.matches("^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$")) {
            throw new IllegalArgumentException("Formato de email inválido");
        }
    }
    
    private void validatePassword(String password) {
        if (password == null || password.length() < 6) {
            throw new IllegalArgumentException("La contraseña debe tener al menos 6 caracteres");
        }
    }
    
    private void validateName(String nombre) {
        if (nombre == null || nombre.trim().isEmpty()) {
            throw new IllegalArgumentException("El nombre es obligatorio");
        }
        if (nombre.length() < 2 || nombre.length() > 100) {
            throw new IllegalArgumentException("El nombre debe tener entre 2 y 100 caracteres");
        }
    }

    public User updateUser(Long id, UserController.UserUpdateRequest request, PasswordEncoder passwordEncoder) {
        User user = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        if (request.getNombre() != null && !request.getNombre().isBlank()) {
            user.setNombre(request.getNombre().trim());
        }

        if (request.getEmail() != null && !request.getEmail().isBlank()) {
            user.setEmail(request.getEmail().trim().toLowerCase());
        }

        // Solo si se manda una nueva contraseña
        if (request.getPassword() != null && !request.getPassword().isBlank()) {
            user.setPassword(passwordEncoder.encode(request.getPassword()));
        }

        // Cambiar rol si corresponde
        if (request.getRoleId() != null && !request.getRoleId().isBlank()) {
            try {
                Long roleId = Long.parseLong(request.getRoleId());
                Role role = roleRepository.findById(roleId)
                        .orElseThrow(() -> new RuntimeException("Rol no encontrado"));
                user.setRole(role);
            } catch (NumberFormatException e) {
                // fallback: buscar por nombre
                Role role = roleRepository.findByNombre(request.getRoleId())
                        .orElseThrow(() -> new RuntimeException("Rol no encontrado"));
                user.setRole(role);
            }
        }

        return repository.save(user);
    }

}
