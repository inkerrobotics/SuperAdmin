#!/bin/bash

echo "🏗️  Building Super Admin Dashboard (Unified Deployment)"
echo "=================================================="

# Build frontend
echo "📦 Building frontend..."
cd frontend
npm run build
cd ..

# Copy frontend build to backend public directory
echo "📁 Copying frontend build to backend..."
rm -rf backend/public
cp -r frontend/dist backend/public

# Build backend
echo "🔧 Building backend..."
cd backend
npm run build
cd ..

echo "✅ Build complete!"
echo ""
echo "To run the unified application:"
echo "  cd backend && node dist/app.js"
echo ""
echo "The application will be available at http://localhost:5001"