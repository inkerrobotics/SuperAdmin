# Deployment Guide

## Docker Deployment

### Prerequisites
- Docker and Docker Compose installed
- Environment variables configured

### Local Docker Deployment

1. **Create `.env` file in root directory:**
```env
# Database
DATABASE_URL=postgresql://super_admin_user:your_password@postgres:5432/super_admin
DIRECT_URL=postgresql://super_admin_user:your_password@postgres:5432/super_admin
POSTGRES_USER=super_admin_user
POSTGRES_PASSWORD=your_password
POSTGRES_DB=super_admin

# Backend
NODE_ENV=production
PORT=5001
JWT_SECRET=your-jwt-secret-key-here
JWT_EXPIRES_IN=24h
ENCRYPTION_KEY=your-32-character-encryption-key

# Frontend
FRONTEND_URL=http://localhost
VITE_API_URL=http://localhost:5001
```

2. **Build and run containers:**
```bash
docker-compose up -d --build
```

3. **Check container status:**
```bash
docker-compose ps
```

4. **View logs:**
```bash
docker-compose logs -f backend
docker-compose logs -f frontend
```

5. **Stop containers:**
```bash
docker-compose down
```

### Backend Dockerfile Features
- **Base Image**: Node.js 18 Alpine (lightweight)
- **Build Dependencies**: Includes Python3, Make, G++ for bcrypt native bindings
- **Optimizations**: 
  - Multi-stage build concept
  - Removes build dependencies after compilation
  - Uses `npm ci` for faster, reproducible builds
- **Prisma**: Generates client during build
- **TypeScript**: Compiles to JavaScript before runtime

### Frontend Dockerfile Features
- **Multi-stage Build**: Separates build and runtime stages
- **Builder Stage**: Node.js 18 Alpine for building React app
- **Production Stage**: Nginx Alpine for serving static files
- **Optimizations**:
  - Minimal production image size
  - Nginx for high-performance static file serving
  - Custom nginx configuration

## Render.com Deployment

### Prerequisites
- Render.com account
- GitHub repository connected to Render

### Deployment Steps

1. **Push code to GitHub:**
```bash
git push origin dev
```

2. **Render will automatically:**
   - Detect `render.yaml` configuration
   - Create PostgreSQL database
   - Build and deploy backend service
   - Build and deploy frontend service
   - Generate JWT_SECRET and ENCRYPTION_KEY

3. **Manual Configuration (if needed):**
   - Go to Render Dashboard
   - Select your services
   - Add/update environment variables
   - Trigger manual deploy if needed

### Render Configuration Features

**Backend Service:**
- **Type**: Web service
- **Environment**: Node.js
- **Region**: Singapore
- **Build Command**: Installs dependencies, generates Prisma client, builds TypeScript
- **Start Command**: Runs migrations then starts server
- **Health Check**: `/api/health` endpoint
- **Auto-scaling**: Supported on paid plans

**Frontend Service:**
- **Type**: Static site
- **Build Command**: Builds React production bundle
- **Publish Path**: `./frontend/dist`
- **Routing**: SPA routing with rewrite rules

**Database:**
- **Type**: PostgreSQL
- **Region**: Singapore
- **Plan**: Starter (can be upgraded)
- **Automatic Backups**: Included

### Environment Variables

**Backend:**
- `NODE_ENV`: production
- `PORT`: 5001
- `DATABASE_URL`: Auto-generated from database
- `DIRECT_URL`: Auto-generated from database
- `JWT_SECRET`: Auto-generated secure value
- `JWT_EXPIRES_IN`: 24h
- `ENCRYPTION_KEY`: Auto-generated secure value
- `FRONTEND_URL`: Frontend service URL

**Frontend:**
- `VITE_API_URL`: Backend service URL

## Production Checklist

### Security
- ✅ Passwords hashed with bcrypt (10 salt rounds)
- ✅ JWT tokens for authentication
- ✅ WhatsApp credentials encrypted with AES-256-CBC
- ✅ Environment variables for sensitive data
- ✅ CORS configured for frontend URL
- ✅ HTTP-only cookies for tokens

### Database
- ✅ Prisma migrations automated
- ✅ Connection pooling configured
- ✅ Backup strategy in place (Render automatic backups)

### Monitoring
- ✅ Health check endpoint configured
- ✅ Console logging for debugging
- ✅ Activity logs stored in database

### Performance
- ✅ Production builds optimized
- ✅ Static assets served by Nginx
- ✅ Database indexes on frequently queried fields
- ✅ Docker images optimized for size

## Troubleshooting

### Backend Issues

**bcrypt build errors:**
```bash
# Rebuild with build dependencies
docker-compose build --no-cache backend
```

**Database connection errors:**
```bash
# Check DATABASE_URL format
# Ensure database is running
docker-compose logs postgres
```

**Migration errors:**
```bash
# Run migrations manually
docker-compose exec backend npx prisma migrate deploy
```

### Frontend Issues

**API connection errors:**
- Verify `VITE_API_URL` points to correct backend URL
- Check CORS configuration in backend

**Build errors:**
```bash
# Clear cache and rebuild
docker-compose build --no-cache frontend
```

### Docker Issues

**Port conflicts:**
```bash
# Check what's using the port
netstat -ano | findstr :5001
netstat -ano | findstr :80

# Change ports in docker-compose.yml if needed
```

**Volume issues:**
```bash
# Remove volumes and restart
docker-compose down -v
docker-compose up -d
```

## Scaling Considerations

### Horizontal Scaling
- Backend can be scaled horizontally (multiple instances)
- Use load balancer (Render provides this)
- Session management uses JWT (stateless)

### Database Scaling
- Consider connection pooling (Prisma Accelerate)
- Upgrade database plan as needed
- Implement read replicas for heavy read operations

### Caching
- Consider Redis for session storage
- Cache frequently accessed data
- Implement CDN for static assets

## Maintenance

### Regular Tasks
1. Monitor application logs
2. Review database performance
3. Update dependencies regularly
4. Backup database (automated on Render)
5. Review and rotate secrets periodically

### Updates
```bash
# Pull latest changes
git pull origin dev

# Rebuild and restart
docker-compose up -d --build

# Or on Render: Push to GitHub and auto-deploy
```

## Support

For issues or questions:
1. Check logs: `docker-compose logs -f`
2. Review Render dashboard for service status
3. Check database connection and migrations
4. Verify environment variables are set correctly
