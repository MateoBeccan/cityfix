<p align="right">
  <a href="README.md">🌐 Leer en Español</a>
</p>

# 🏙️ CityFix – Urban Claim Management Platform + Social Feed


CityFix es una plataforma que permite a los ciudadanos reportar problemas urbanos y a las autoridades gestionarlos de forma eficiente.
Con la nueva actualización, se incorpora un feed social público, donde los usuarios pueden interactuar mediante likes y comentarios, fomentando la participación ciudadana.

⚙️ Tecnologías Utilizadas
🧠 Backend

Java 21

Spring Boot 3.x

Spring Security 6 + JWT

Spring Data JPA

Swagger / OpenAPI 3

🗄️ Base de Datos

MySQL

🏗️ Arquitectura

Patrón MVC con capas:

controller/ → Controladores REST

service/ → Lógica de negocio

repository/ → Acceso a datos

model/ → Entidades JPA

security/ → Configuración de seguridad

config/ → Configuraciones generales

👥 Sistema de Roles
Rol	Permisos principales
🧍‍♂️ CIUDADANO	Crear, ver y eliminar sus propios reclamos
🧑‍💼 OPERADOR	Ver todos los reclamos y cambiar estados
🧑‍💻 ADMIN	Acceso completo al sistema
🔐 Autenticación y Autorización

JWT para autenticación stateless

@PreAuthorize para control granular de endpoints

Filtros personalizados para rutas públicas y privadas

🗃️ Entidades Principales

User → Usuarios del sistema con roles

Role → Roles de autorización (ADMIN, OPERADOR, CIUDADANO)

Claim → Reclamos urbanos

Status → Estados de reclamo

Category → Categorías de reclamo

ClaimHistory → Historial de cambios

Comment → Comentarios de usuarios

Like → Soporte ciudadano en reclamos

🚀 Endpoints Principales
Método	Endpoint	Descripción
POST	/api/auth/register	Registro de usuario
POST	/api/auth/login	Inicio de sesión
GET	/api/claims/my-claims	Reclamos del usuario autenticado
PUT	/api/claims/{id}/status	Cambio de estado (Operador/Admin)
GET	/api/claims/feed	Feed público con likes y comentarios
GET	/swagger-ui.html	Documentación API interactiva
🎯 Características Implementadas

✅ Autenticación y autorización completa con JWT
✅ CRUD de reclamos con control por roles
✅ Gestión de estados por operadores
✅ Documentación automática con Swagger
✅ Arquitectura escalable, limpia y modular

🆕 Nuevas funcionalidades del Feed Social

📰 Feed público (/feed) — visible sin login

❤️ Sistema de Likes — los usuarios pueden apoyar reclamos relevantes

💬 Sistema de Comentarios — permite discusión y seguimiento colaborativo

🧭 Diseño visual unificado — navbar y estilo coherente con el resto del sistema

🔄 Corrección de navegación — eliminación de doble barra en vistas internas

📖 Documentación Swagger

La API está documentada con Swagger UI.
Podés acceder desde tu navegador en:

🔗 http://localhost:8080/swagger-ui.html

👨‍💻 Autor

Mateo Beccan
📍 Rosario, Santa Fe, Argentina
📧 mateobeccan@gmail.com

🔗 [LinkedIn] https://www.linkedin.com/in/mateobeccan/

