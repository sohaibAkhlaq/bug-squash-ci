#!/bin/bash

echo "🚀 Deploying BugSquash CI..."

# Pull latest changes
echo "📦 Pulling latest code..."
git pull origin main

# Backend deployment
echo "🔧 Building backend..."
cd server
npm install --production
pm2 restart ecosystem.config.js || pm2 start ecosystem.config.js
pm2 save

# Frontend deployment
echo "🎨 Building frontend..."
cd ../client
npm install
npm run build -- --configuration production

# Copy built files
echo "📂 Copying build files..."
sudo cp -r dist/client/browser/* /var/www/bugsquash-ci/

# Nginx reload
echo "🔄 Reloading Nginx..."
sudo systemctl reload nginx

echo "✅ Deployment complete!"
echo "🌐 Application available at http://your-domain.com"
