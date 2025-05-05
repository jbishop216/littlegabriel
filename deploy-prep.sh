#!/bin/bash

# =============================================================================
# DEPLOYMENT PREPARATION SCRIPT
# This script ensures all the necessary environment variables are available
# during deployment and prepares the application for production.
# =============================================================================

echo "🚀 Preparing for deployment..."

# Run our environment setup script
echo "1️⃣ Updating environment variables from secrets..."
node update-env-for-deploy.js

# Check for the _document.js file
echo "2️⃣ Verifying document structure..."
if [ -f "pages/_document.js" ]; then
  echo "✅ pages/_document.js exists"
else
  echo "❌ pages/_document.js is missing - creating it"
  mkdir -p pages
  cat > pages/_document.js << 'EOF'
import { Html, Head, Main, NextScript } from 'next/document'

export default function Document() {
  return (
    <Html lang="en">
      <Head />
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}
EOF
fi

# Verify the src/pages directory structure
if [ ! -d "src/pages" ]; then
  echo "Creating src/pages directory"
  mkdir -p src/pages
fi

if [ ! -f "src/pages/_document.tsx" ]; then
  echo "Creating src/pages/_document.tsx"
  cat > src/pages/_document.tsx << 'EOF'
import { Html, Head, Main, NextScript } from 'next/document'

export default function Document() {
  return (
    <Html lang="en">
      <Head />
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}
EOF
fi

# Run the environment variable check
echo "3️⃣ Checking environment variables..."
node deployment-check.js

echo "4️⃣ Cleaning build directory..."
rm -rf .next

echo "✅ Deployment preparation complete!"