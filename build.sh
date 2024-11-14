#!/bin/bash
set -e

echo "Starting build process..."

# Install dependencies
npm install

# Clean dist directory
rm -rf dist

# Build with production webpack config
npx webpack --config webpack.config.prod.js

# Verify critical files exist
critical_files=(
  "dist/index.html"
  "dist/bundle."*".js"
  "dist/game.css"
  "dist/audio"
  "dist/models"
  "dist/assets"
)

for file in "${critical_files[@]}"; do
  if ! ls $file 1> /dev/null 2>&1; then
    echo "Error: Missing critical file or directory: $file"
    exit 1
  fi
done

# Create _headers file for Netlify/Vercel
cat > dist/_headers << EOL
/*
  Access-Control-Allow-Origin: *
  Cache-Control: public, max-age=31536000
/audio/*
  Content-Type: audio/mpeg
/*.js
  Content-Type: application/javascript
/*.css
  Content-Type: text/css
EOL

echo "Build completed successfully!"