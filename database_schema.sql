-- CityFix Database Schema
-- Run this script to create a clean database schema that matches the JPA entities

DROP DATABASE IF EXISTS cityfixdb;
CREATE DATABASE cityfixdb;
USE cityfixdb;

-- Tabla de roles
CREATE TABLE roles (
    id_rol BIGINT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL UNIQUE
);

-- Tabla de usuarios
CREATE TABLE usuarios (
    id_usuario BIGINT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    id_rol BIGINT NOT NULL,
    FOREIGN KEY (id_rol) REFERENCES roles(id_rol)
);

-- Tabla de categorías
CREATE TABLE categorias (
    id_categoria BIGINT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL UNIQUE,
    descripcion VARCHAR(255)
);

-- Tabla de estados
CREATE TABLE estados (
    id_estado BIGINT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL UNIQUE
);

-- Tabla de reclamos
CREATE TABLE reclamos (
    id_reclamo BIGINT AUTO_INCREMENT PRIMARY KEY,
    titulo VARCHAR(150) NOT NULL,
    descripcion TEXT NOT NULL,
    ubicacion VARCHAR(255),
    imagen_url VARCHAR(255),
    fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    id_usuario BIGINT NOT NULL,
    id_categoria BIGINT NOT NULL,
    id_estado BIGINT NOT NULL,
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario),
    FOREIGN KEY (id_categoria) REFERENCES categorias(id_categoria),
    FOREIGN KEY (id_estado) REFERENCES estados(id_estado)
);

-- Insertar datos básicos
INSERT INTO roles (nombre) VALUES 
('ADMIN'), 
('OPERADOR'), 
('CIUDADANO');

INSERT INTO estados (nombre) VALUES 
('Pendiente'), 
('En Proceso'), 
('Resuelto'), 
('Rechazado');

INSERT INTO categorias (nombre, descripcion) VALUES 
('Alumbrado Público', 'Problemas con el alumbrado de calles y espacios públicos'),
('Baches y Pavimento', 'Problemas en calles, veredas y pavimento'),
('Limpieza Urbana', 'Problemas de limpieza y recolección de residuos'),
('Espacios Verdes', 'Mantenimiento de plazas y espacios verdes'),
('Señalización', 'Problemas con señales de tránsito y urbanas'),
('Otros', 'Otros problemas urbanos');