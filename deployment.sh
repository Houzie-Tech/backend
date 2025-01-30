#!/bin/bash

# Pull latest changes (if using Git)
if [ -d ".git" ]; then
    echo "Pulling latest changes..."
    git pull origin main
fi

# Install dependencies
echo "Installing dependencies..."
npm install

# Generate Prisma client
echo "Generating Prisma client..."
npx prisma generate

# Run database migrations (optional, if applicable)
echo "Running Prisma migrations..."
npx prisma migrate deploy

# Build the application
echo "Building the project..."
npm run build

# Restart the application using PM2
echo "Restarting application with PM2..."
pm2 stop index || true
pm2 start dist/main.js 

# Save PM2 process list and enable startup
pm2 save
pm2 startup

# Display running processes
echo "Application deployed successfully!"
pm2 status

exit 0
