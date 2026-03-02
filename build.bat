@echo off
echo 🏗️  Building Super Admin Dashboard (Unified Deployment)
echo ==================================================

REM Build frontend
echo 📦 Building frontend...
cd frontend
call npm run build
cd ..

REM Copy frontend build to backend public directory
echo 📁 Copying frontend build to backend...
if exist backend\public rmdir /s /q backend\public
xcopy /e /i frontend\dist backend\public

REM Build backend
echo 🔧 Building backend...
cd backend
call npm run build
cd ..

echo ✅ Build complete!
echo.
echo To run the unified application:
echo   cd backend ^&^& node dist/app.js
echo.
echo The application will be available at http://localhost:5001