# Finance Dashboard Backend

Backend API for a finance dashboard system built as an internship-style backend assessment. The project focuses on role-based access control, user management, validation, database-backed persistence, and Swagger documentation.

## Overview

This repository demonstrates backend engineering fundamentals for a finance dashboard scenario. The current implementation focuses on:

- JWT-based authentication for login
- Admin-only user management
- Search and filtering for users by email, role, and active status
- Role-based access control middleware
- Validation with Zod
- Prisma + PostgreSQL persistence
- Swagger API documentation
- Seed script for an initial admin user

The project is intentionally kept small and clean so it is easy to review, test, and extend.

## Tech Stack

- Node.js
- Express.js
- TypeScript
- PostgreSQL
- Prisma ORM
- Zod
- JWT
- Swagger / swagger-jsdoc / swagger-ui-express

## Implemented Features

### Authentication

- `POST /api/auth/login`
- JWT token generation
- Inactive users are blocked from logging in

### User Management

Admin-only user APIs:

- `POST /api/users` - create user
- `GET /api/users` - list users
- `GET /api/users/:id` - get single user
- `PATCH /api/users/:id` - update user
- `DELETE /api/users/:id` - delete user

User listing supports:

- search by email
- filter by role
- filter by active status
- pagination with `page` and `limit`

### Security and Access Control

- `authenticate` middleware validates JWT tokens
- `authorize(["ADMIN"])` restricts user management endpoints to admins
- Passwords are hashed with bcrypt
- Passwords are never returned in API responses

### Validation and Error Handling

- Zod request validation for login and user CRUD
- Centralized error middleware
- Proper HTTP status codes for common cases such as invalid credentials, conflict, and not found

### Documentation

- Swagger UI available at `/api-docs`
- Route-level Swagger comments for auth and user endpoints
- Swagger server URL switches between localhost and production URL based on environment

### Seed Data

- `seed:admin` script creates or updates an admin user
- Uses environment variables so the admin account can be configured easily

## Assignment Status

This project currently covers part of the internship assignment:

- User and role management: completed
- Access control logic: completed
- Validation and error handling: completed
- Data persistence: completed
- Search support: completed for users
- API documentation: completed for implemented routes

Still remaining:

- Financial records management (transactions CRUD and filtering)
- Dashboard summary / insight APIs

## Project Structure

```bash
src/
	app.ts
	server.ts
	config/
	docs/
	lib/
	middlewares/
	modules/
		auth/
		users/
	routes/
	scripts/
	types/
prisma/
```

## API Documentation

Swagger UI:

- Local: `http://localhost:3000/api-docs`

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

Create a `.env` file with:

```env
PORT=3000
NODE_ENV=dev
DATABASE_URL=your_postgres_connection_string
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=1h
PROD_URL=https://your-production-url.example.com
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=Admin@12345
```

### 3. Run Prisma generate + build

```bash
npm run build
```

### 4. Seed admin user

```bash
npm run seed:admin
```

### 5. Start development server

```bash
npm run dev
```

## Available Scripts

- `npm run dev` - start the server in development
- `npm run build` - generate Prisma client and compile TypeScript
- `npm run seed:admin` - create or update the admin user

## Main API Routes

- `POST /api/auth/login`
- `POST /api/users`
- `GET /api/users`
- `GET /api/users/:id`
- `PATCH /api/users/:id`
- `DELETE /api/users/:id`

## Assumptions

- Admin users are seeded manually for local development and review.
- The project currently focuses on user management before transaction and dashboard modules.
- Search is performed at the database level through Prisma filters.

## Notes for Reviewers

If you are evaluating this as an assignment submission, the strongest parts of the current implementation are:

- clear separation of routes, controllers, services, and validation
- admin-only security for user management
- database-backed search and filtering
- Swagger documentation for reviewer usability
- a seed script to make the project easy to test quickly
