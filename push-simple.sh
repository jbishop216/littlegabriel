#!/bin/bash

# Set up git config
git config --global user.email "user@replit.com"
git config --global user.name "Replit User"

# Stage just the new page file
git add src/app/clear-auth/page.tsx

# Commit with a simple message
git commit -m "Add clear-auth page to reset site authentication"

# Force push only this commit
git push --force https://${GITHUB_TOKEN}@github.com/jbishop216/littlegabriel2.git HEAD:main

echo "Push attempted!"