#!/bin/bash

# Exit on error
set -e

# Install dependencies
npm ci  # Using ci instead of install for more reliable builds

# Clean dist directory
npm run clean

# Build the application
npm run build

# Create build info
echo "{\"buildTime\": \"$(date)\", \"version\": \"$(node -p "require('./package.json').version")\"}" > dist/build-info.json

# Verify dist directory contents
echo "Build completed. Contents of dist directory:"
ls -la dist/