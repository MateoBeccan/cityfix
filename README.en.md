<p align="right">
  <a href="README.en.md">🌐 Read in English</a>
</p>

# 🏙️ CityFix – Plataforma de Reclamos Urbanos + Feed Social

CityFix is a collaborative platform that empowers citizens to report urban issues and helps city authorities manage them efficiently.
With the latest update, CityFix evolves into a social feed experience, allowing users to interact through likes and comments, making the platform more engaging and community-driven.

⚙️ Tech Stack
🧠 Backend

Java 21

Spring Boot 3.x

Spring Security 6 + JWT

Spring Data JPA

Swagger / OpenAPI 3

🗄️ Database

MySQL

🧩 Architecture

MVC Pattern with layered structure:

controller/ → REST Controllers

service/ → Business Logic

repository/ → Data Access Layer

model/ → JPA Entities

security/ → Security Configuration

config/ → Application Settings

👥 Role System
Role	Description
🧍‍♂️ Citizen	Create, view, and manage their own claims
🧑‍💼 Operator	View all claims and update their status
🧑‍💻 Admin	Full access to all system functionalities
🔐 Authentication & Authorization

JWT-based authentication (stateless)

@PreAuthorize annotations for granular access control

Custom security filters for public and private routes

🗃️ Core Entities

User → Registered system users

Role → Access control roles (ADMIN, OPERATOR, CITIZEN)

Claim → Urban issue reports

Status → Claim progress state

Category → Type of report (e.g., lighting, roads, waste)

ClaimHistory → Change tracking for claims

Comment → User discussions on claims

Like → User support for community reports

🚀 Main API Endpoints
Method	Endpoint	Description
POST	/api/auth/register	User registration
POST	/api/auth/login	User login
GET	/api/claims/my-claims	Retrieve user’s own claims
PUT	/api/claims/{id}/status	Update claim status (Operator/Admin)
GET	/api/claims/feed	Public feed with likes and comments
GET	/swagger-ui.html	API documentation via Swagger
🎯 Implemented Features

✅ Full JWT authentication and role-based authorization
✅ CRUD operations for claims with user restrictions
✅ Claim status management by operators
✅ Integrated Swagger UI documentation
✅ Clean and scalable architecture

🆕 New Social Feed Features

📰 Public Feed (/feed) — accessible without login

❤️ Like System — citizens can support or endorse important claims

💬 Comment System — open discussion and citizen collaboration

🧭 Unified UI Design — consistent navigation bar and theme across pages

🔄 Improved Routing — fixed duplicate navbar issue on internal views

📖 Swagger Documentation

The API is fully documented and accessible via Swagger UI:
👉 http://localhost:8080/swagger-ui.html

🌍 About CityFix

CityFix promotes citizen participation and urban transparency.
Through a clean interface and social features, it enables communities to:

Share and track public issues

Support others’ claims through likes

Discuss and collaborate on city improvements

👨‍💻 Author

Mateo Beccan
📍 Rosario, Santa Fe, Argentina
📧 mateobeccan@gmail.com

🔗 LinkedIn

🔗 GitHub
