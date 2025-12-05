---
name: MonoMart
tools: [Java, Spring Boot, Spring Framework, PostgreSQL, JPA/Hibernate, JWT, Swagger, Maven]
image: https://static.startuptalky.com/2022/04/Backend-Development-E-commerce-website-StartupTalky.jpg
description: A modern, single-vendor e-commerce backend application built with Spring Boot 3, PostgreSQL, and JWT authentication.
link: https://github.com/RHJihan/MonoMart
---

MonoMart is a modern, single-vendor e-commerce backend application built with **Spring Boot 3**, **PostgreSQL**, and **JWT authentication**. It provides a complete RESTful API for managing products, categories, shopping carts, orders, and user authentication with role-based access control.

![preview](https://localdigitalkit.com/wp-content/uploads/2023/05/ecommerce-marketplace.jpg)

## 🌟 Features

### Core Functionality
- **User Management**: Registration, authentication, and role-based access (USER/ADMIN)
- **Product Catalog**: Full CRUD operations for products with category organization
- **Category Management**: Hierarchical product categorization
- **Shopping Cart**: Add, update, remove items with persistent cart functionality
- **Order Processing**: Create orders from cart, track order status
- **JWT Authentication**: Secure token-based authentication with refresh tokens

### Technical Highlights
- **Modern Stack**: Spring Boot 3.3.2 with Java 17
- **Database**: PostgreSQL with Liquibase migrations
- **Security**: Spring Security with JWT tokens
- **API Documentation**: Swagger/OpenAPI integration
- **Data Mapping**: MapStruct for efficient DTO mappings
- **Validation**: Bean validation with custom validators
- **CORS**: Configurable cross-origin resource sharing
- **Containerized**: Docker and Docker Compose ready

## 🏗️ Architecture

```
├── controller/          # REST API endpoints
├── service/            # Business logic layer
├── repository/         # Data access layer
├── domain/            # Entity models
├── dto/               # Data transfer objects
├── security/          # JWT and authentication
├── config/            # Application configuration
└── exception/         # Global exception handling
```


## 🌐 API Documentation

### Swagger UI
Once the application is running, access the interactive API documentation:
- **Swagger UI**: http://localhost:8080/swagger-ui.html
- **OpenAPI JSON**: http://localhost:8080/api-docs

### API Endpoints Overview

#### Authentication
- `POST /api/v1/auth/signup` - User registration
- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/admin/login` - Admin login
- `POST /api/v1/auth/refresh` - Refresh JWT token

#### Products
- `GET /api/v1/products` - List products (paginated)
- `GET /api/v1/products/{id}` - Get product details
- `POST /api/v1/products` - Create product (Admin only)
- `PUT /api/v1/products/{id}` - Update product (Admin only)
- `DELETE /api/v1/products/{id}` - Delete product (Admin only)

#### Categories
- `GET /api/v1/categories` - List all categories
- `GET /api/v1/categories/{id}` - Get category details
- `POST /api/v1/categories` - Create category (Admin only)
- `PUT /api/v1/categories/{id}` - Update category (Admin only)
- `DELETE /api/v1/categories/{id}` - Delete category (Admin only)

#### Shopping Cart
- `GET /api/v1/cart` - Get user's cart
- `POST /api/v1/cart/items` - Add item to cart
- `PUT /api/v1/cart/items/{id}` - Update cart item
- `DELETE /api/v1/cart/items/{id}` - Remove cart item
- `DELETE /api/v1/cart` - Clear entire cart

#### Orders
- `GET /api/v1/orders` - List all orders (Admin) or user orders
- `GET /api/v1/orders/{id}` - Get order details
- `POST /api/v1/orders` - Create order from cart
- `PUT /api/v1/orders/{id}/status` - Update order status (Admin only)

### Sample API Usage

#### Register a new user
```bash
curl -X POST http://localhost:8080/api/v1/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "username": "john",
    "email": "john@example.com",
    "password": "Passw0rd!"
  }'
```

#### Login and get JWT token
```bash
curl -X POST http://localhost:8080/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "usernameOrEmail": "john",
    "password": "Passw0rd!"
  }'
```

#### Access protected endpoints
```bash
curl -X GET http://localhost:8080/api/v1/cart \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```
---

**MonoMart** - Building the future of e-commerce, one API at a time! 🚀
