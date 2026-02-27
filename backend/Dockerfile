# Backend Dockerfile
FROM node:18-alpine

# Install build dependencies for bcrypt
RUN apk add --no-cache python3 make g++

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY prisma ./prisma/

# Install dependencies (including bcrypt native bindings)
RUN npm ci --only=production

# Copy application files
COPY . .

# Generate Prisma Client
RUN npx prisma generate

# Build TypeScript
RUN npm run build

# Remove build dependencies to reduce image size
RUN apk del python3 make g++

# Expose port
EXPOSE 5001

# Start application
CMD ["npm", "start"]
