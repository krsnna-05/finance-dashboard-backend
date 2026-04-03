# Finance Dashboard Backend

Backend API for a finance dashboard system built as an internship assessment project. The implementation focuses on clean backend architecture, role-based access control, reliable validation/error handling, and practical data processing APIs.

## Overview

This project implements a finance backend where users operate with role-based permissions.

Roles:

- ADMIN: full access (users + transactions + insights)
- ANALYST: read transactions + insights
- VIEWER: read insights only

Core implementation includes:

- JWT login authentication
- User management (admin-only)
- Transaction CRUD with filtering and pagination
- Dashboard insights and trend analytics
- Centralized error handling and Zod validation
- Swagger API documentation
- PostgreSQL persistence using Prisma

## Tech Stack

- Node.js
- Express.js
- TypeScript
- PostgreSQL (NeonDB)
- Prisma ORM
- Zod
- JWT
- Swagger (swagger-jsdoc + swagger-ui-express)

## Live Project

Live URL :

## Assignment Coverage

### Core Requirements Status

- User and role management: completed
- Financial records management: completed
- Dashboard summary APIs: completed
- Access control logic: completed
- Validation and error handling: completed
- Data persistence: completed

### Optional Enhancements Status

- Authentication using tokens: completed
- Pagination for record listing: completed
- Search support: completed
- API documentation: completed
- Unit/integration tests: not implemented
- Rate limiting: not implemented

## Implemented Modules

### Auth Module

- POST /api/auth/login

Highlights:

- JWT token generation
- Blocks inactive users from login

### Users Module

Admin-only endpoints:

- POST /api/users
- GET /api/users
- GET /api/users/:id
- PATCH /api/users/:id
- DELETE /api/users/:id

Query features on list endpoint:

- email search (partial match)
- filter by role
- filter by isActive
- pagination via page and limit

### Transactions Module

Endpoints:

- POST /api/transactions (ADMIN)
- GET /api/transactions (ADMIN, ANALYST)
- GET /api/transactions/:id (ADMIN, ANALYST)
- PATCH /api/transactions/:id (ADMIN)
- DELETE /api/transactions/:id (ADMIN)

Query features:

- filter by userId
- filter by type (income or expense)
- filter by category (partial, case-insensitive)
- filter by date range (startDate, endDate)
- pagination via page and limit

### Dashboard Module

Endpoints:

- GET /api/dashboard/summary (ADMIN, ANALYST, VIEWER)

Returns:

- total income
- total expenses
- net balance
- category-wise totals
- recent transactions
- monthly trends

Supports optional filters:

- userId
- startDate
- endDate
- months (trend window)

## Security and Access Control

- authenticate middleware validates bearer tokens
- authorize middleware enforces role-level access
- Passwords are hashed using bcrypt
- Password fields are not exposed in API responses

## Validation and Error Handling

- Zod validation for body, params, and query inputs
- Centralized Express error middleware
- Proper HTTP status codes for auth, validation, and data errors
- Prisma error cases normalized in middleware

## Swagger API Docs

- Swagger UI route: /api-docs
- Includes auth, users, transactions, and dashboard routes
- Swagger server URL auto-switches by environment:
  - dev: http://localhost:\{PORT\}
  - prod: PROD_URL from environment

## Environment Variables

Create a .env file:

```env
PORT=3000
NODE_ENV=dev
DATABASE_URL=your_postgres_connection_string
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=1h
PROD_URL=your_production_url
```

Optional variables for admin seed customization:

```env
ADMIN_EMAIL=admin@finance.local
ADMIN_PASSWORD=Admin@12345
```

## Setup and Run

1. Install dependencies

```bash
npm install
```

2. Build (includes prisma generate)

```bash
npm run build
```

3. Seed admin user

```bash
npm run seed:admin
```

4. Start dev server

```bash
npm run dev
```

## Scripts

- npm run dev
- npm run build
- npm run start
- npm run seed:admin

## Project Structure

```bash
src/
  app.ts
  server.ts
  config/
  docs/
  lib/
  middlewares/
    auth.middleware.ts
    role.middleware.ts
    error.middleware.ts
  modules/
    auth/
    users/
    transactions/
    dashboard/
  routes/
  scripts/
  types/
prisma/
```

## Notes for Reviewers

This submission is designed to demonstrate backend engineering decisions clearly:

- clean route-controller-service-validation separation
- RBAC middleware over hardcoded controller checks
- database-level filtering/search
- aggregation-focused dashboard endpoint
- reviewer-friendly setup with seed + Swagger
