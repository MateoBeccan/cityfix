package com.backend.cityfix.controller;

import com.backend.cityfix.security.AuthService;
import com.backend.cityfix.security.model.AuthRequest;
import com.backend.cityfix.security.model.AuthResponse;
import com.backend.cityfix.security.model.RegisterRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    //  LOGIN
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody AuthRequest request) {
        try {
            AuthResponse response = authService.login(request);
            return ResponseEntity.ok(response);

        } catch (BadCredentialsException e) {
            // Contraseña incorrecta
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Bad credentials"));

        } catch (UsernameNotFoundException e) {
            // Usuario no encontrado
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "User not found"));

        } catch (DisabledException e) {
            // Usuario desactivado
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "User disabled"));

        } catch (Exception e) {
            // Error interno o de conexión
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Internal server error"));
        }
    }

    //  REGISTRO (Ciudadano por defecto)
    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest request) {
        try {
            AuthResponse response = authService.registerCitizen(request);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);

        } catch (RuntimeException e) {
            // Errores esperados (email duplicado, rol no encontrado, etc.)
            return ResponseEntity.badRequest()
                    .body(Map.of("error", e.getMessage()));

        } catch (Exception e) {
            // Errores generales
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Registration failed"));
        }
    }

    //  Endpoint opcional para inicializar roles, estados y categorías
    @PostMapping("/init")
    public ResponseEntity<?> initSystem() {
        try {
            String rolesMsg = authService.initRoles();
            String categoriesMsg = authService.initBasicCategories();
            return ResponseEntity.ok(Map.of(
                    "roles", rolesMsg,
                    "categories", categoriesMsg
            ));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", e.getMessage()));
        }
    }
}
