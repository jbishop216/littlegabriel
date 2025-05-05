#!/bin/bash

# Set up git config first
git config --global user.email "user@replit.com"
git config --global user.name "Replit User"

# Stage only the specific file we want to update
git add src/app/clear-auth/page.tsx push-minimal.sh

# Create a commit
git commit -m "Add clear-auth page to reset site authentication"

# Add just our file to GitHub using the API instead of a full push
FILE_CONTENT=$(cat src/app/clear-auth/page.tsx | base64)
curl -X PUT \
  -H "Authorization: token ${GITHUB_TOKEN}" \
  -H "Accept: application/vnd.github.v3+json" \
  -d "{\"message\": \"Add clear-auth page\", \"content\": \"${FILE_CONTENT}\", \"branch\": \"main\"}" \
  "https://api.github.com/repos/jbishop216/littlegabriel2/contents/src/app/clear-auth/page.tsx"

echo "File update attempted via GitHub API"