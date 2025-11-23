package com.backend.cityfix.security;

import com.backend.cityfix.model.Category;
import com.backend.cityfix.model.Role;
import com.backend.cityfix.model.User;
import com.backend.cityfix.repository.CategoryRepository;
import com.backend.cityfix.repository.RoleRepository;
import com.backend.cityfix.repository.StatusRepository;
import com.backend.cityfix.repository.UserRepository;
import com.backend.cityfix.security.model.AuthRequest;
import com.backend.cityfix.security.model.AuthResponse;
import com.backend.cityfix.security.model.RegisterRequest;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final StatusRepository statusRepository;
    private final CategoryRepository categoryRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;

    public AuthService(UserRepository userRepository, RoleRepository roleRepository,
                       StatusRepository statusRepository, CategoryRepository categoryRepository,
                       PasswordEncoder passwordEncoder, JwtService jwtService,
                       AuthenticationManager authenticationManager) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.statusRepository = statusRepository;
        this.categoryRepository = categoryRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.authenticationManager = authenticationManager;
    }

    // Registro por defecto: CIUDADANO
    public AuthResponse registerCitizen(RegisterRequest request) {
        return registerWithRole(request, "CIUDADANO");
    }

    // Registro genérico con rol
    public AuthResponse registerWithRole(RegisterRequest request, String roleName) {
        Role role = roleRepository.findByNombre(roleName)
                .orElseThrow(() -> new RuntimeException("Rol " + roleName + " no encontrado"));

        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new RuntimeException("El correo ya está registrado.");
        }

        User user = User.builder()
                .nombre(request.getNombre())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(role)
                .build();

        userRepository.save(user);
        String jwt = jwtService.generateToken(user);

        return new AuthResponse(jwt);
    }

    // Login con manejo de errores específicos
    public AuthResponse login(AuthRequest request) {
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
            );
        } catch (BadCredentialsException e) {
            throw new BadCredentialsException("Bad credentials");
        } catch (DisabledException e) {
            throw new DisabledException("User disabled");
        } catch (Exception e) {
            throw new RuntimeException("Authentication error");
        }

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));

        String jwt = jwtService.generateToken(user);

        return new AuthResponse(jwt);
    }

    // Inicializa roles y estados base
    public String initRoles() {
        createRoleIfNotExists("ADMIN");
        createRoleIfNotExists("OPERADOR");
        createRoleIfNotExists("CIUDADANO");
        initBasicStatuses();
        return "Roles y estados inicializados correctamente";
    }

    private void initBasicStatuses() {
        createStatusIfNotExists("Pendiente");
        createStatusIfNotExists("En Proceso");
        createStatusIfNotExists("Resuelto");
        createStatusIfNotExists("Rechazado");
    }

    private void createStatusIfNotExists(String name) {
        statusRepository.findByNombreIgnoreCase(name)
                .orElseGet(() -> statusRepository.save(
                        com.backend.cityfix.model.Status.builder()
                                .nombre(name)
                                .build()));
    }

    public String initBasicCategories() {
        createCategoryIfNotExists("Alumbrado Público", "Problemas con el alumbrado de calles y espacios públicos");
        createCategoryIfNotExists("Baches y Pavimento", "Problemas en calles, veredas y pavimento");
        createCategoryIfNotExists("Limpieza Urbana", "Problemas de limpieza y recoleción de residuos");
        createCategoryIfNotExists("Espacios Verdes", "Mantenimiento de plazas y espacios verdes");
        createCategoryIfNotExists("Señalización", "Problemas con señales de tránsito y urbanas");
        createCategoryIfNotExists("Otros", "Otros problemas urbanos");
        return "Categorías básicas inicializadas correctamente";
    }

    private void createCategoryIfNotExists(String name, String description) {
        categoryRepository.findByNombre(name)
                .orElseGet(() -> categoryRepository.save(
                        Category.builder()
                                .nombre(name)
                                .descripcion(description)
                                .build()));
    }

    private void createRoleIfNotExists(String name) {
        roleRepository.findByNombre(name)
                .orElseGet(() -> roleRepository.save(Role.builder().nombre(name).build()));
    }

    public AuthResponse registerAdminSafe(RegisterRequest request) {
        if (userRepository.findAll().stream().anyMatch(u -> u.getRole().getNombre().equals("ADMIN"))) {
            throw new RuntimeException("Ya existe un administrador. Usa un token ADMIN para registrar más.");
        }
        return registerWithRole(request, "ADMIN");
    }
}
