#!/bin/bash

# =============================================================================
# COMPLETE DEPLOYMENT BUILD SCRIPT
# This script prepares and builds the application for deployment
# =============================================================================

echo "🚀 Starting complete deployment build process..."

# Step 1: Clean up the build directory and node_modules
echo "1️⃣ Cleaning build artifacts..."
rm -rf .next
rm -rf node_modules/.cache

# Step 2: Update environment variables
echo "2️⃣ Setting up environment variables..."
node update-env-for-deploy.js

# Step 3: Verify the required directory structure
echo "3️⃣ Ensuring all critical files exist..."

# Create the basic _document.js file
echo "Creating pages/_document.js..."
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

# Create the not-found.js file
echo "Creating pages/not-found.js..."
cat > pages/not-found.js << 'EOF'
export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-4xl font-bold text-center mb-4">
        404 - Page Not Found
      </h1>
      <p className="text-lg text-center mb-8">
        The page you are looking for does not exist.
      </p>
    </div>
  );
}
EOF

# Create the _app.js file
echo "Creating pages/_app.js..."
cat > pages/_app.js << 'EOF'
import '../src/app/globals.css'

export default function App({ Component, pageProps }) {
  return <Component {...pageProps} />
}
EOF

# Step 4: Install dependencies if needed
echo "4️⃣ Checking dependencies..."
npm install --silent

# Step 5: Run the build process
echo "5️⃣ Running production build..."
NODE_ENV=production ANALYZE=false npm run build

echo "✅ Build process complete!"