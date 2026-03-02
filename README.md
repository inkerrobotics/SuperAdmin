# Super Admin Dashboard

A unified multi-tenant SaaS platform for managing Lucky Draw systems with comprehensive admin controls, tenant management, and analytics.

## 🚀 Quick Start (Unified Deployment)

The application is now configured as a single service where the backend serves both API endpoints and the frontend static files.

### Prerequisites

- Node.js 18+ 
- PostgreSQL database
- npm or yarn

### Environment Setup

1. **Clone and install dependencies:**
```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies  
cd ../frontend
npm install
cd ..
```

2. **Configure environment variables:**
```bash
# Copy example environment file
cp backend/.env.example backend/.env

# Edit backend/.env with your database credentials:
DATABASE_URL="postgresql://username:password@host:port/database"
JWT_SECRET="your-jwt-secret-key"
ENCRYPTION_KEY="your-32-character-encryption-key"
```

3. **Setup database:**
```bash
cd backend
npx prisma migrate deploy
npx prisma generate
npm run create-super-admin  # Creates admin@example.com / Admin@123
cd ..
```

### Build and Run

#### Option 1: Using build scripts
```bash
# Windows
build.bat

# Linux/Mac  
chmod +x build.sh
./build.sh

# Run the unified application
cd backend
node dist/app.js
```

#### Option 2: Manual build
```bash
# Build frontend
cd frontend
npm run build
cd ..

# Copy frontend to backend
rm -rf backend/public
cp -r frontend/dist backend/public

# Build backend
cd backend  
npm run build

# Run unified application
node dist/app.js
```

The application will be available at **http://localhost:5001**

- Frontend: http://localhost:5001
- API: http://localhost:5001/api/*
- Health Check: http://localhost:5001/api/health

### Default Login
- **Email:** admin@example.com
- **Password:** Admin@123

## 🐳 Docker Deployment

### Local Docker Build
```bash
docker build -t super-admin-dashboard .
docker run -p 5001:5001 -e DATABASE_URL="your-db-url" super-admin-dashboard
```

### Production Deployment (Render)

The application is configured for single-service deployment on Render:

1. **Connect your repository to Render**
2. **The `render.yaml` configures:**
   - Single web service with Docker build
   - PostgreSQL database
   - Environment variables
   - Health checks

3. **Required environment variables:**
   - `DATABASE_URL` (auto-configured from database)
   - `JWT_SECRET` (auto-generated)
   - `ENCRYPTION_KEY` (auto-generated)

## 🏗️ Architecture

### Unified Deployment Structure
```
├── Dockerfile              # Multi-stage build (frontend + backend)
├── render.yaml             # Single service deployment config
├── build.sh / build.bat    # Build automation scripts
├── frontend/               # React TypeScript frontend
│   ├── src/
│   ├── dist/              # Build output (copied to backend/public)
│   └── package.json
├── backend/                # Node.js Express backend  
│   ├── src/
│   ├── dist/              # TypeScript build output
│   ├── public/            # Frontend static files (from frontend/dist)
│   ├── prisma/            # Database schema and migrations
│   └── package.json
└── docker-compose.yml      # Development environment
```

### Key Features
- **Single Port:** Everything runs on port 5001
- **Unified CORS:** No cross-origin issues
- **Static Serving:** Backend serves frontend files
- **API Routes:** All API endpoints under `/api/*`
- **SPA Support:** Catch-all route for React Router

## 🔧 Development

For development, you can still run frontend and backend separately:

```bash
# Terminal 1: Backend (API only)
cd backend
npm run dev  # Runs on port 5001

# Terminal 2: Frontend (with proxy)  
cd frontend
npm run dev  # Runs on port 5173, proxies API calls to :5001
```

## 📊 Features

- **Multi-tenant Management:** Create and manage tenant organizations
- **Role-based Access Control:** Granular permissions system
- **Analytics Dashboard:** Comprehensive metrics and insights
- **Security:** bcrypt password hashing, JWT authentication, AES-256 encryption
- **Database:** PostgreSQL with Prisma ORM
- **Responsive UI:** Modern React with Tailwind CSS

## 🔐 Security

- Passwords hashed with bcrypt (10 salt rounds)
- JWT tokens for authentication
- AES-256-CBC encryption for sensitive data
- CORS protection
- Input validation and sanitization

## 📝 API Documentation

### Authentication
- `POST /api/auth/super-admin/login` - Super admin login
- `POST /api/auth/logout` - Logout

### Tenant Management  
- `GET /api/tenants` - List all tenants
- `POST /api/tenants/create` - Create new tenant
- `PUT /api/tenants/:id` - Update tenant
- `DELETE /api/tenants/:id` - Delete tenant

### Analytics
- `GET /api/analytics` - Dashboard statistics
- `GET /api/analytics/health` - System health metrics

### Health Check
- `GET /api/health` - Application health status

## 🚀 Deployment Notes

### Environment Variables
- `NODE_ENV=production` for production builds
- `PORT=5001` (default, configurable)
- `DATABASE_URL` for PostgreSQL connection
- `JWT_SECRET` for token signing
- `ENCRYPTION_KEY` for data encryption

### Database Migrations
```bash
cd backend
npx prisma migrate deploy  # Apply migrations
npx prisma generate        # Generate client
```

### Monitoring
- Health check endpoint: `/api/health`
- Logs available via `docker logs` or Render dashboard
- Database connection status in health response

## 📞 Support

For issues or questions:
1. Check the health endpoint: `/api/health`
2. Review application logs
3. Verify database connectivity
4. Ensure all environment variables are set

---

**Single Service Architecture** - Frontend and backend unified for simplified deployment and management.