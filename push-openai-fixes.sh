#!/bin/bash

# First ensure our OpenAI fixes are applied
echo "=== Ensuring OpenAI fixes are applied ==="
node scripts/ensure-openai-assistant.js

# Set up git config
git config --global user.email "user@replit.com"
git config --global user.name "Replit User"

# Check if we have the token
if [ -z "$GITHUB_TOKEN" ]; then
  echo "Error: GitHub token not set. Please set the GITHUB_TOKEN environment variable."
  echo "Using existing token in git config..."
fi

# Set the remote URL with authentication if token is available
if [ ! -z "$GITHUB_TOKEN" ]; then
  REPO_URL="https://${GITHUB_TOKEN}@github.com/jbishop216/littlegabriel2.git"
  git remote set-url origin "$REPO_URL"
  echo "GitHub token applied to repository URL"
fi

# Pull latest changes from GitHub first
echo "\nPulling latest changes from GitHub..."
git pull origin main --rebase

# Add specific files related to our OpenAI fixes
echo "\nAdding OpenAI Assistant fixes to staging..."
git add src/lib/openai-fallback-check.js
git add .env.production
git add scripts/ensure-openai-assistant.js
git add test-openai-in-production-mode.js
git add verify-production-mode.js
git add test-production-openai.js

# Create commit with detailed message
echo "\nCreating commit..."
git commit -m "Fix OpenAI Assistant in Production\n\nThis commit includes:\n- Updated openai-fallback-check.js to prioritize Assistant API in production\n- FORCE_OPENAI_ASSISTANT=true in environment variables\n- Test scripts to verify assistant works in production mode\n- Documentation and deployment scripts" || echo "No changes to commit"

# Push to GitHub
echo "\nPushing changes to GitHub..."
git push origin main

# Verify push status
if [ $? -eq 0 ]; then
  echo "\n✓ Successfully pushed OpenAI Assistant fixes to GitHub"
  echo "Repository: https://github.com/jbishop216/littlegabriel2"
  echo "You can now view your code on GitHub."
else
  echo "\n✗ Failed to push changes to GitHub"
  echo "Error details:"
  git status
fi
