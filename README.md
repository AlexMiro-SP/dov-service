# DOV Service 🚀

A modern NestJS backend service for DOV platform, built with TypeScript, Prisma, and PostgreSQL.

## 🌟 Features

- **Modern Architecture**: Built with NestJS, TypeScript, and modern best practices
- **Database**: PostgreSQL with Prisma ORM for type-safe database operations
- **Authentication**: JWT-based authentication with role-based access control
- **API Documentation**: Auto-generated Swagger/OpenAPI documentation
- **Testing**: Comprehensive unit and e2e tests with Jest
- **Code Quality**: ESLint, Prettier, Husky pre-commit hooks
- **CI/CD**: GitHub Actions workflow with automated testing and deployment
- **Containerization**: Docker support with multi-stage builds
- **Monitoring**: Health checks, version endpoints, and logging
- **Security**: Input validation, CORS, rate limiting, and security headers

## 🏗️ Architecture

```
src/
├── auth/           # Authentication & authorization
├── user/           # User management
├── snippet/        # Snippet CRUD operations
├── assignment/     # Assignment management
├── category-type/  # Category type management
├── common/         # Shared utilities and decorators
├── prisma/         # Database service
└── main.ts         # Application entry point
```

## 🚀 Quick Start

### Prerequisites

- Node.js 20+
- pnpm (recommended) or npm
- PostgreSQL 15+
- Docker (optional)

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd dov-service

# Install dependencies
pnpm install

# Copy environment variables
cp .env.example .env

# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate deploy
```

### Development

```bash
# Start development server
pnpm start:dev

# Run with Docker Compose
docker-compose up -d
```

The API will be available at:
- **API**: http://localhost:3000
- **Swagger Docs**: http://localhost:3000/api
- **Health Check**: http://localhost:3000/health
- **Version Info**: http://localhost:3000/version

## 📝 Available Scripts

```bash
# Development
pnpm start:dev          # Start development server
pnpm start:debug        # Start with debugging

# Building
pnpm build              # Build for production
pnpm start:prod         # Start production server

# Testing
pnpm test               # Run unit tests
pnpm test:watch         # Run tests in watch mode
pnpm test:e2e           # Run e2e tests
pnpm test:cov           # Run tests with coverage

# Code Quality
pnpm lint               # Run ESLint
pnpm format             # Format code with Prettier
pnpm format:check       # Check code formatting
pnpm type-check         # Run TypeScript type checking
pnpm deep-check         # Run comprehensive quality checks

# Database
npx prisma generate     # Generate Prisma client
npx prisma migrate dev  # Run migrations in development
npx prisma studio       # Open Prisma Studio
```

## 🐳 Docker

### Development with Docker Compose

```bash
# Start all services (PostgreSQL + Redis + App)
docker-compose up -d

# Start only database services
docker-compose up postgres redis -d

# Start development mode
docker-compose --profile dev up -d

# View logs
docker-compose logs -f app

# Stop all services
docker-compose down
```

### Production Docker Build

```bash
# Build production image
docker build -t dov-service:latest .

# Run production container
docker run -p 3000:3000 \
  -e DATABASE_URL="postgresql://user:pass@host:5432/db" \
  -e JWT_SECRET="your-secret" \
  dov-service:latest
```

## 🔍 Deep Check & Quality Assurance

### Deep Check Overview

The deep check is a comprehensive code quality verification that ensures code health and maintainability:

```bash
# Run full deep check
npm run deep-check
```

This includes:
- ✅ TypeScript type checking
- ✅ ESLint with auto-fix
- ✅ Prettier formatting verification
- ✅ Unit tests
- ✅ E2E tests

### Automated Quality Monitoring

#### Weekly Deep Check
- **Schedule**: Every Sunday at 6:00 AM Jerusalem time
- **Workflow**: `.github/workflows/weekly-check.yml`
- **Action**: Creates GitHub issue on failure with detailed diagnostics

#### Renovate Integration
- **Schedule**: Every Sunday at 6:00 AM Jerusalem time (same as deep check)
- **Auto-merge**: Dev dependencies and type definitions
- **Manual review**: Framework updates, Prisma, ESLint/Prettier
- **Security**: Immediate vulnerability alerts

### Quality Gates

```bash
# Before committing
npm run type-check && npm run lint && npm run test

# Before deploying
npm run deep-check

# Manual trigger weekly check
# Via GitHub Actions UI or:
gh workflow run weekly-check.yml
```

### Documentation
- **Deep Check Guide**: [DEEP_CHECK.md](./DEEP_CHECK.md)
- **Code Owners**: [.github/CODEOWNERS](./.github/CODEOWNERS)
- **Renovate Config**: [renovate.json](./renovate.json)

## 🔧 Configuration

All configuration is done via environment variables. See `.env.example` for all available options.

### Key Environment Variables

```bash
# Application
NODE_ENV=development
PORT=3000

# Database
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/dov_db

# JWT Authentication
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=1d

# External APIs
CLAUDE_API_KEY=your-claude-api-key
DJANGO_API_BASE_URL=https://your-django-api.com
```

## 🧪 Testing

The project includes comprehensive testing:

- **Unit Tests**: Test individual components and services
- **E2E Tests**: Test complete API endpoints
- **Coverage Reports**: Track test coverage

```bash
# Run all tests
pnpm test

# Run specific test file
pnpm test src/app.service.spec.ts

# Run e2e tests
pnpm test:e2e

# Generate coverage report
pnpm test:cov
```

## 📚 API Documentation

The API is fully documented using Swagger/OpenAPI:

- **Swagger UI**: http://localhost:3000/api
- **OpenAPI JSON**: http://localhost:3000/api-json

### Key Endpoints

- `GET /` - Hello World
- `GET /health` - Health check
- `GET /version` - Version information
- `POST /auth/login` - User authentication
- `GET /snippets` - List snippets
- `POST /snippets` - Create snippet
- `GET /assignments` - List assignments

## 🔒 Security

The application implements several security measures:

- **JWT Authentication**: Secure token-based authentication
- **Role-based Access Control**: ADMIN, EDITOR, USER roles
- **Input Validation**: Request validation using class-validator
- **CORS**: Configurable cross-origin resource sharing
- **Rate Limiting**: Prevent abuse with rate limiting
- **Security Headers**: Helmet.js for security headers

## 🚀 Deployment

The project supports multiple deployment options:

### GitHub Actions CI/CD

The project includes a complete CI/CD pipeline:

1. **Code Quality**: ESLint, Prettier, TypeScript checks
2. **Testing**: Unit and e2e tests
3. **Security**: Dependency audit
4. **Docker**: Build and test Docker images
5. **Release**: Semantic versioning and releases
6. **Deploy**: Automated deployment to staging/production

### Manual Deployment

```bash
# Build for production
pnpm build

# Start production server
pnpm start:prod
```

### Docker Deployment

```bash
# Production deployment with Docker Compose
docker-compose -f docker-compose.yml up -d
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Commit Convention

We use [Conventional Commits](https://conventionalcommits.org/):

- `feat:` - New features
- `fix:` - Bug fixes
- `docs:` - Documentation changes
- `style:` - Code style changes
- `refactor:` - Code refactoring
- `test:` - Adding tests
- `chore:` - Maintenance tasks

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

If you have any questions or need help:

1. Check the [documentation](docs/)
2. Search existing [issues](../../issues)
3. Create a new [issue](../../issues/new)

## 🎯 Roadmap

- [ ] GraphQL API support
- [ ] Real-time features with WebSockets
- [ ] Advanced caching with Redis
- [ ] Microservices architecture
- [ ] Advanced monitoring and logging

---

**Built with ❤️ using NestJS, TypeScript, and modern best practices**
