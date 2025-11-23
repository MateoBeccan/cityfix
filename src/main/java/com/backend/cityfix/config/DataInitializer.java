package com.backend.cityfix.config;

import com.backend.cityfix.model.Role;
import com.backend.cityfix.model.Status;
import com.backend.cityfix.repository.RoleRepository;
import com.backend.cityfix.repository.StatusRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
public class DataInitializer implements CommandLineRunner {

    private final StatusRepository statusRepository;
    private final RoleRepository roleRepository;

    public DataInitializer(StatusRepository statusRepository, RoleRepository roleRepository) {
        this.statusRepository = statusRepository;
        this.roleRepository = roleRepository;
    }

    @Override
    public void run(String... args) throws Exception {
        // Crear roles básicos si no existen
        createRoleIfNotExists("ADMIN");
        createRoleIfNotExists("OPERADOR");
        createRoleIfNotExists("CIUDADANO");
        
        // Crear estados básicos si no existen
        createStatusIfNotExists("Pendiente");
        createStatusIfNotExists("En Proceso");
        createStatusIfNotExists("Resuelto");
        createStatusIfNotExists("Rechazado");
    }

    private void createRoleIfNotExists(String nombre) {
        if (roleRepository.findByNombre(nombre).isEmpty()) {
            Role role = Role.builder()
                    .nombre(nombre)
                    .build();
            roleRepository.save(role);
        }
    }

    private void createStatusIfNotExists(String nombre) {
        if (statusRepository.findByNombreIgnoreCase(nombre).isEmpty()) {
            Status status = Status.builder()
                    .nombre(nombre)
                    .build();
            statusRepository.save(status);
        }
    }
}