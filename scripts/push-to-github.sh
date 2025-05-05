#!/bin/bash

# Script to push changes to GitHub

echo "=== Preparing to push to GitHub ==="

# Check if we can access GitHub
echo "Checking GitHub access..."
git ls-remote --exit-code origin > /dev/null
if [ $? -ne 0 ]; then
  echo "❌ Error: Cannot access GitHub. Please check your credentials."
  exit 1
fi
echo "✅ GitHub access confirmed"

# Ensure the ensure-openai-assistant.js script has been run
echo "\nRunning ensure-openai-assistant.js to apply OpenAI fixes..."
node scripts/ensure-openai-assistant.js
if [ $? -ne 0 ]; then
  echo "❌ Error applying OpenAI fixes"
  exit 1
fi

# Add all changes
echo "\nAdding changes to git..."
git add .

# Create a descriptive commit message
commit_message="Fix OpenAI Assistant in Production\n\nThis commit includes:\n- Fix for openai-fallback-check.js to properly detect production mode\n- Environment settings to ensure OpenAI Assistant API is used in production\n- Test scripts to verify the Assistant works in production mode\n- Proper error handling for OpenAI API requests"

# Commit the changes
echo "\nCommitting changes..."
git commit -m "$commit_message"

# Pull the latest changes from GitHub to avoid conflicts
echo "\nPulling latest changes from GitHub..."
git pull --rebase

# Push the changes
echo "\nPushing changes to GitHub..."
git push origin main

if [ $? -eq 0 ]; then
  echo "\n✅ Successfully pushed changes to GitHub!"
  echo "Repository: https://github.com/jbishop216/littlegabriel2"
  echo "You can now view your code on GitHub."
else
  echo "\n❌ Error pushing changes to GitHub. Please check the error message above."
  exit 1
fi
