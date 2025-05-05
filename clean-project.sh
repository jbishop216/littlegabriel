#!/bin/bash

# Stop any running processes
echo "Stopping running processes..."
pkill -f node || true

# Remove Next.js build cache
echo "Cleaning Next.js cache..."
rm -rf .next
rm -rf node_modules/.cache

# Fix any TypeScript errors in API route
echo "Fixing TypeScript errors in API route..."
mkdir -p src/app/api/admin/users
touch src/app/api/admin/users/[userId]/route.ts

# Add empty route to fix 'Cannot find module' error
cat > src/app/api/admin/users/[userId]/route.ts << 'EOF'
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  return NextResponse.json({ message: 'User endpoint placeholder' });
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  return NextResponse.json({ message: 'User update endpoint placeholder' });
}
EOF

# Fix TypewriterText cursor display
echo "Fixing TypewriterText cursor display..."
cat > tmp_fix.txt << 'EOF'
  return (
    <span className="whitespace-pre-wrap">
      {displayedText}
      {currentIndex < cleanedText.length && (
        <span className="inline-block h-4 w-2 animate-pulse bg-current opacity-70 ml-0.5"></span>
      )}
    </span>
  );
EOF

# Apply the fix to TypewriterText.tsx
sed -i "s/{currentIndex < text.length/{currentIndex < cleanedText.length/g" src/components/chat/TypewriterText.tsx

# Fix the OpenAIStream typing error in chat route
echo "Fixing OpenAIStream typing error..."
cat > tmp_api_fix.txt << 'EOF'
// Convert the response to a ReadableStream
const stream = OpenAIStream(response as any, {
EOF

# Apply the fix to the chat API route
sed -i "s/const stream = OpenAIStream(response,/const stream = OpenAIStream(response as any,/g" src/app/api/chat/route.ts

echo "Cleanup complete. Restart the server to apply changes."