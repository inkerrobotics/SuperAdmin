#!/usr/bin/env bash
# Render build script for backend

set -e

echo "Installing dependencies..."
npm ci

echo "Generating Prisma Client..."
npx prisma generate

echo "Building TypeScript..."
npm run build

echo "Build completed successfully!"