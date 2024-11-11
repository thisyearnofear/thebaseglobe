#!/bin/bash

# Install dependencies
npm install

# Set production environment
export NODE_ENV=production

# Clean dist directory
rm -rf dist

# Build the application
npm run build

# Create redirects file
echo "/* /index.html 200" > dist/_redirects

# Create build info
echo "{\"buildTime\": \"$(date)\", \"version\": \"$(node -p "require('./package.json').version")\"}" > dist/build-info.json