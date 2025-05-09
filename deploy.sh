#!/bin/bash

# Build the Next.js application
echo "Building the Next.js application..."
npm run build

# Create a temporary directory for deployment
echo "Creating temporary directory for deployment..."
mkdir -p tmp_deploy

# Copy the exported files to the temporary directory
echo "Copying exported files..."
cp -r out/* tmp_deploy/

# Create a .nojekyll file to bypass Jekyll processing
echo "Creating .nojekyll file..."
touch tmp_deploy/.nojekyll

# Switch to gh-pages branch or create it if it doesn't exist
echo "Switching to gh-pages branch..."
git checkout gh-pages 2>/dev/null || git checkout -b gh-pages

# Remove existing files except .git directory
echo "Cleaning up existing files..."
find . -maxdepth 1 ! -name .git ! -name . ! -name tmp_deploy -exec rm -rf {} \;

# Copy the contents of the temporary directory to the root
echo "Moving files to root directory..."
cp -r tmp_deploy/* .
cp tmp_deploy/.nojekyll .

# Remove the temporary directory
echo "Cleaning up temporary directory..."
rm -rf tmp_deploy

# Add all files to git
echo "Adding files to git..."
git add .

# Commit changes
echo "Committing changes..."
git commit -m "Deploy to GitHub Pages"

# Push to GitHub
echo "Pushing to GitHub..."
git push origin gh-pages

# Switch back to main branch
echo "Switching back to main branch..."
git checkout main

echo "Deployment complete! Your site will be available at https://webtrova.github.io/tourney-morel/"
