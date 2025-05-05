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

# List of specific files we want to push
FILES=(
  "src/components/SiteProtectionWrapper.tsx"
  "src/context/PasswordContext.tsx"
  "src/app/layout.tsx"
  "src/app/api/auth/[...nextauth]/route.ts"
  "src/app/clear-auth/page.tsx"
)

# Add only our specific files
echo "Adding specific files to staging..."
for file in "${FILES[@]}"; do
  if [ -f "$file" ]; then
    echo "Adding $file..."
    git add "$file"
  else
    echo "File not found: $file"
  fi
done

# Create commit
echo "Creating commit..."
git commit -m "Update auth flow and fix site password issues" || echo "No changes to commit"

# Push to GitHub, but use --force-with-lease which is safer than -f
echo "Pushing changes to GitHub..."
git push --force-with-lease origin main

# Verify push status
if [ $? -eq 0 ]; then
  echo "✓ Successfully pushed changes to GitHub"
else
  echo "✗ Failed to push changes to GitHub"
  echo "Error details:"
  git status
fi