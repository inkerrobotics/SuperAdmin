#!/usr/bin/env bash
# Render start script for backend

set -e

echo "Running database migrations..."
npx prisma migrate deploy

echo "Starting application..."
node dist/app.js
