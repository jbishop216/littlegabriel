#!/bin/bash

# Set up git config
git config --global user.email "user@replit.com"
git config --global user.name "Replit User"

# Check if we have the token
if [ -z "$GITHUB_TOKEN" ]; then
  echo "Error: GitHub token not set. Please set the GITHUB_TOKEN environment variable."
  exit 1
fi

# Set the remote URL with authentication
REPO_URL="https://${GITHUB_TOKEN}@github.com/jbishop216/littlegabriel2.git"
git remote set-url origin "$REPO_URL"

# Pull latest changes from GitHub first
echo "Pulling latest changes from GitHub..."
git pull origin main --rebase

# Add all changed files
echo "Adding all changes to staging..."
git add .

# Create commit
echo "Creating commit..."
git commit -m "Update authentication flow and fix site password issues" || echo "No changes to commit"

# Push to GitHub with force flag to overwrite remote changes if needed
echo "Pushing changes to GitHub..."
git push -f origin main

# Verify push status
if [ $? -eq 0 ]; then
  echo "✓ Successfully pushed all changes to GitHub"
else
  echo "✗ Failed to push changes to GitHub"
  echo "Error details:"
  git status
fi