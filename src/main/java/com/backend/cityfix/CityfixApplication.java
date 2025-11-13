package com.backend.cityfix;

import com.backend.cityfix.security.AuthService;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;

@SpringBootApplication
public class CityfixApplication {

	public static void main(String[] args) {
		SpringApplication.run(CityfixApplication.class, args);
	}

	// Inicialización automática de roles, estados y categorías al iniciar la aplicación
	@Bean
	CommandLineRunner initData(AuthService authService) {
		return args -> {
			authService.initRoles();
			authService.initBasicCategories();
		};
	}
}
