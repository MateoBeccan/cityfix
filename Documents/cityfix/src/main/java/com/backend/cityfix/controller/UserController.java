package com.backend.cityfix.controller;

import com.backend.cityfix.model.User;
import com.backend.cityfix.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.List;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "*")
public class UserController {
    
    private final UserService service;
    private final PasswordEncoder passwordEncoder;
    
    public UserController(UserService service, PasswordEncoder passwordEncoder) { 
        this.service = service;
        this.passwordEncoder = passwordEncoder;
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<User>> getAll() { 
        return ResponseEntity.ok(service.getAll()); 
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<User> getById(@PathVariable Long id) { 
        return service.getById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build()); 
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<User> create(@RequestBody User user) { 
        return ResponseEntity.ok(service.save(user)); 
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> update(@PathVariable Long id, @RequestBody UserUpdateRequest request) {
        try {
            User updatedUser = service.updateUser(id, request, passwordEncoder);
            return ResponseEntity.ok(updatedUser);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (RuntimeException e) {
            return ResponseEntity.status(404).body(e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> delete(@PathVariable Long id) { 
        service.delete(id); 
        return ResponseEntity.ok().build();
    }
    
    // Crear usuario con rol específico
    @PostMapping("/create-with-role")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<User> createUserWithRole(@RequestBody CreateUserRequest request) {
        return ResponseEntity.ok(service.createUserWithRole(request, passwordEncoder));
    }
    
    // DTO para crear usuario con rol
    public static class CreateUserRequest {
        private String nombre;
        private String email;
        private String password;
        private String roleName;
        
        // Getters y setters
        public String getNombre() { return nombre; }
        public void setNombre(String nombre) { this.nombre = nombre; }
        
        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
        
        public String getPassword() { return password; }
        public void setPassword(String password) { this.password = password; }
        
        public String getRoleName() { return roleName; }
        public void setRoleName(String roleName) { this.roleName = roleName; }
    }

    public static class UserUpdateRequest {
        private String nombre;
        private String email;
        private String password;
        private String roleId; // o roleName si lo preferís

        public String getNombre() { return nombre; }
        public void setNombre(String nombre) { this.nombre = nombre; }

        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }

        public String getPassword() { return password; }
        public void setPassword(String password) { this.password = password; }

        public String getRoleId() { return roleId; }
        public void setRoleId(String roleId) { this.roleId = roleId; }
    }

}
