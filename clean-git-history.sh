#!/bin/bash

echo "This script will clean your Git history of sensitive information."
echo "IMPORTANT: This will rewrite history. Anyone with a copy of the repository will need to reset their local copy."
echo "Press Ctrl+C to cancel or Enter to continue."
read

# Make sure .env is in .gitignore
if ! grep -q "^.env$" .gitignore; then
  echo ".env" >> .gitignore
  echo "Added .env to .gitignore"
fi

# Create a branch in case something goes wrong
git checkout -b backup_branch

# Use git filter-branch to remove .env files from history
git filter-branch -f --index-filter 'git rm --cached --ignore-unmatch .env' HEAD

echo ""
echo "History cleaned of .env files."
echo ""
echo "NEXT STEPS:"
echo "1. Update your database password on Neon.tech"
echo "2. Update the DATABASE_URL in .env with the new password"
echo "3. Change your site password"
echo "4. Force push this cleaned branch to GitHub with:"
echo "   git push -f origin main"
echo ""
echo "Your NextAuth secret has already been regenerated."