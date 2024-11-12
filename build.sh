#!/bin/bash

# Exit on error
set -e

# Echo commands for debugging
set -x

# Install dependencies
echo "Installing dependencies..."
npm ci

# Ensure src directory exists in the build environment
echo "Checking source directory structure..."
if [ ! -d "src" ]; then
    echo "Creating src directory structure..."
    mkdir -p src/components
    mkdir -p src/managers
    mkdir -p src/utils
fi

# Copy source files if they're not in the correct location
echo "Copying source files..."
if [ ! -f "src/utils/Utils.js" ]; then
    cp -r ./src/* ./src/ 2>/dev/null || :
fi

# Clean dist directory
echo "Cleaning dist directory..."
npm run clean

# Build the application
echo "Building application..."
NODE_ENV=production npm run build

# Verify build output
echo "Verifying build output..."
if [ ! -d "dist" ]; then
    echo "Error: dist directory not created"
    exit 1
fi

# Create build info
echo "Creating build info..."
echo "{\"buildTime\": \"$(date)\", \"version\": \"$(node -p "require('./package.json').version")\"}" > dist/build-info.json

# Copy any additional required assets
echo "Copying additional assets..."
if [ -d "public" ]; then
    cp -r public/* dist/ 2>/dev/null || :
fi

# Copy redirects file if it exists
if [ -f "_redirects" ]; then
    cp _redirects dist/
fi

# List contents of dist directory
echo "Build completed. Contents of dist directory:"
ls -la dist/

# Verify critical files exist
echo "Verifying critical files..."
if [ ! -f "dist/index.html" ]; then
    echo "Error: index.html not found in dist"
    exit 1
fi

echo "Build script completed successfully"