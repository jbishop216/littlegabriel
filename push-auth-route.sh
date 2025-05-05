#!/bin/bash

# For the NextAuth route file with special characters in the name
FILE_PATH="src/app/api/auth/[...nextauth]/route.ts"
COMMIT_MESSAGE="Update NextAuth route for improved authentication flow"

# Check if GitHub token exists
if [ -z "$GITHUB_TOKEN" ]; then
  echo "Error: GITHUB_TOKEN environment variable is not set"
  exit 1
fi

# Base variables
OWNER="jbishop216"
REPO="littlegabriel2"
BRANCH="main"
# Manual URL encoding for the file path
ENCODED_PATH="src/app/api/auth/%5B...nextauth%5D/route.ts"
BASE_URL="https://api.github.com/repos/$OWNER/$REPO/contents"

echo "Checking if file exists: $FILE_PATH (encoded as: $ENCODED_PATH)"
RESPONSE=$(curl -s -H "Authorization: token $GITHUB_TOKEN" "$BASE_URL/$ENCODED_PATH")

# Convert the file content to base64
CONTENT=$(base64 -w 0 "$FILE_PATH")
echo "Content length: $(echo -n "$CONTENT" | wc -c) bytes"

# Check if file exists
if echo "$RESPONSE" | grep -q "sha"; then
  SHA=$(echo "$RESPONSE" | grep -o '"sha": *"[^"]*"' | head -1 | sed 's/"sha": *"//;s/"//g')
  echo "File exists with SHA: $SHA"
  
  # Create a file with the JSON payload
  PAYLOAD_FILE="auth-route-payload-$(date +%s).json"
  cat > "$PAYLOAD_FILE" << EOF
{
  "message": "$COMMIT_MESSAGE",
  "content": "$CONTENT",
  "sha": "$SHA",
  "branch": "$BRANCH"
}
EOF
  
  echo "Updating file..."
  RESPONSE=$(curl -s -X PUT \
    -H "Authorization: token $GITHUB_TOKEN" \
    -H "Accept: application/vnd.github.v3+json" \
    -d @"$PAYLOAD_FILE" \
    "$BASE_URL/$ENCODED_PATH")
  
  if echo "$RESPONSE" | grep -q "content"; then
    echo "✓ Successfully updated $FILE_PATH"
  else
    echo "✗ Failed to update $FILE_PATH"
    echo "$RESPONSE" | grep -o '"message": *"[^"]*"' | sed 's/"message": *"//;s/"//g'
    echo "First 500 characters of response:"
    echo "$RESPONSE" | head -c 500
  fi
  
  # Clean up
  rm -f "$PAYLOAD_FILE"
else
  echo "File doesn't exist or couldn't be accessed"
  echo "First 500 characters of response:"
  echo "$RESPONSE" | head -c 500
  
  # Create a file with the JSON payload for creation
  PAYLOAD_FILE="auth-route-payload-$(date +%s).json"
  cat > "$PAYLOAD_FILE" << EOF
{
  "message": "Create $FILE_PATH",
  "content": "$CONTENT",
  "branch": "$BRANCH"
}
EOF
  
  echo "Creating file..."
  RESPONSE=$(curl -s -X PUT \
    -H "Authorization: token $GITHUB_TOKEN" \
    -H "Accept: application/vnd.github.v3+json" \
    -d @"$PAYLOAD_FILE" \
    "$BASE_URL/$ENCODED_PATH")
  
  if echo "$RESPONSE" | grep -q "content"; then
    echo "✓ Successfully created $FILE_PATH"
  else
    echo "✗ Failed to create $FILE_PATH"
    echo "$RESPONSE" | grep -o '"message": *"[^"]*"' | sed 's/"message": *"//;s/"//g'
    echo "First 500 characters of response:"
    echo "$RESPONSE" | head -c 500
  fi
  
  # Clean up
  rm -f "$PAYLOAD_FILE"
fi