#!/bin/bash

# Production deployment script for LittleGabriel
# This script sets the correct environment and runs the application in production mode

echo "🚀 Starting LittleGabriel in production mode"
echo "=================================================="

# 1. Set the production environment
export NODE_ENV=production

# 2. Check if we're running in a deployment context
if [ -n "$REPL_SLUG" ] && [ -n "$REPL_OWNER" ]; then
  echo "📦 Running in Replit Deployment context: $REPL_OWNER/$REPL_SLUG"
fi

# 3. Check for essential environment variables
echo "📋 Checking environment variables..."
REQUIRED_VARS=(
  "OPENAI_API_KEY"
  "OPENAI_ASSISTANT_ID" 
  "DATABASE_URL"
  "BIBLE_API_KEY"
)

MISSING_VARS=0
for VAR in "${REQUIRED_VARS[@]}"; do
  if [ -z "${!VAR}" ]; then
    echo "❌ Missing required environment variable: $VAR"
    MISSING_VARS=$((MISSING_VARS+1))
  else
    echo "✅ $VAR is set"
  fi
done

if [ $MISSING_VARS -gt 0 ]; then
  echo "❌ $MISSING_VARS required environment variables are missing. Cannot continue."
  echo "⚠️ Please add these variables to your Replit Secrets."
  echo "   Make sure they are also included in the .replit.deploy file."
  exit 1
fi

# 4. Display key configuration (from edited script)
echo "🔑 Using OpenAI Assistant ID: $OPENAI_ASSISTANT_ID"
echo "🌐 Starting server on port 5000"

# 5. Start the Next.js production server on port 5000 (from edited script)
exec npx next start -p 5000