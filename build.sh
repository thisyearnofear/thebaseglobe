#!/bin/bash

# Exit on error and undefined variables
set -eu

# Echo commands for debugging
set -x

# Function to log with timestamp
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1"
}

# Error handler
trap 'log "Error on line $LINENO"' ERR

# Install dependencies
log "Installing dependencies..."
npm ci --prefer-offline --no-audit

# Debug: Show installed packages
log "Listing installed packages..."
npm list webpack webpack-cli

# Ensure src directory exists and has correct structure
log "Checking source directory structure..."
mkdir -p src/{components,managers,utils}

# Debug: List current directory structure
log "Current directory structure:"
ls -R

# Copy source files if they're not in the correct location
log "Copying source files..."
if [ -d "./src" ]; then
    cp -r ./src/* ./src/ 2>/dev/null || log "No files to copy or already exist"
fi

# Clean dist directory
log "Cleaning dist directory..."
rm -rf dist
mkdir -p dist

# Build the application
log "Building application..."
NODE_ENV=production npx webpack --mode production --config webpack.config.js

# Verify build output
log "Verifying build output..."
if [ ! -d "dist" ]; then
    log "Error: dist directory not created"
    exit 1
fi

# Create build info with more details
log "Creating build info..."
cat > dist/build-info.json << EOF
{
    "buildTime": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")",
    "version": "$(node -p "require('./package.json').version")",
    "nodeVersion": "$(node -v)",
    "environment": "${NODE_ENV:-development}"
}
EOF

# Copy additional assets
log "Copying additional assets..."
if [ -d "public" ]; then
    cp -r public/* dist/ 2>/dev/null || log "No public assets to copy"
fi

# Copy redirects file
if [ -f "_redirects" ]; then
    cp _redirects dist/ || log "Failed to copy _redirects file"
fi

# List contents of dist directory
log "Build completed. Contents of dist directory:"
ls -la dist/

# Verify critical files
log "Verifying critical files..."
required_files=("index.html" "js/main.*.js" "js/vendors.*.js")
for file in "${required_files[@]}"; do
    if ! ls dist/$file 1> /dev/null 2>&1; then
        log "Error: Required file pattern '$file' not found in dist"
        exit 1
    fi
done

log "Build script completed successfully"