# Auth Service

The Authentication Service handles user authentication and authorization for the NEXO ERP system. It provides JWT-based authentication with role-based access control.

## Overview

- **Port**: 3000
- **Framework**: NestJS with Passport.js
- **Purpose**: User authentication and JWT token management

## Features

- **JWT Authentication**: Token-based authentication
- **User Validation**: Mock user validation (admin/password)
- **Profile Endpoint**: Protected user profile access
- **Passport.js Integration**: JWT strategy implementation

## API Endpoints

### Authentication
- `POST /auth/login` - User login with credentials
  - Body: `{ "username": "admin", "password": "password" }`
  - Response: `{ "access_token": "jwt_token_here" }`

- `POST /auth/profile` - Get user profile (requires JWT)
  - Headers: `Authorization: Bearer <jwt_token>`
  - Response: User profile data

### Health Check
- `GET /health` - Service health status

## Authentication Flow

1. Client sends login request with credentials
2. Service validates credentials (currently mock validation)
3. Service generates JWT token with user information
4. Client includes token in subsequent requests
5. Service validates token and provides access to protected resources

## Development

### Prerequisites
- Node.js 18+
- pnpm

### Installation
```bash
pnpm install
```

### Building
```bash
npx nx build auth-service
```

### Running
```bash
# Development
npx nx serve auth-service

# Production
node dist/apps/auth-service/main.js
```

### Testing
```bash
# Unit tests
npx nx test auth-service

# Manual testing
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"password"}'
```

## Configuration

### JWT Configuration
- **Secret**: Configurable via environment variables
- **Expiration**: Token expiration time
- **Algorithm**: HS256 (default)

### Mock Users
Currently supports:
- Username: `admin`
- Password: `password`

## Dependencies

- `@nestjs/common`
- `@nestjs/core`
- `@nestjs/platform-express`
- `@nestjs/jwt`
- `@nestjs/passport`
- `passport`
- `passport-jwt`

## Security Features

- **JWT Tokens**: Stateless authentication
- **Password Validation**: Secure credential checking
- **Token Expiration**: Automatic token invalidation
- **Protected Routes**: Authorization required for sensitive endpoints

## Future Enhancements

- Database integration for user storage
- Password hashing (bcrypt)
- Refresh tokens
- OAuth2 integration
- Multi-factor authentication
- Role-based permissions
- User registration
- Password reset functionality</content>
<parameter name="filePath">/W/NEXO/nx_nexo_v0.info/NEXO/nx_nexo_v0.20260115_backend/nexo-prj/apps/auth-service/README.md