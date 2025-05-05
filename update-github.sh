#!/bin/bash

# Check if GitHub token exists
if [ -z "$GITHUB_TOKEN" ]; then
  echo "Error: GITHUB_TOKEN environment variable is not set"
  exit 1
fi

# GitHub API details
OWNER="jbishop216"
REPO="littlegabriel2"
BRANCH="main"
BASE_URL="https://api.github.com/repos/$OWNER/$REPO/contents"

# Function to update a file
update_file() {
  FILE_PATH=$1
  COMMIT_MESSAGE="Update $FILE_PATH"
  
  # Check if file exists before trying to get its SHA
  echo "Checking if $FILE_PATH exists in the repository..."
  RESPONSE=$(curl -s -H "Authorization: token $GITHUB_TOKEN" "$BASE_URL/$FILE_PATH")
  
  # Extract SHA if file exists
  if echo "$RESPONSE" | grep -q "sha"; then
    SHA=$(echo "$RESPONSE" | grep -o '"sha": *"[^"]*"' | head -1 | sed 's/"sha": *"//;s/"//g')
    echo "File exists with SHA: $SHA"
    
    # Encode file content in base64
    CONTENT=$(base64 -w 0 "$FILE_PATH")
    
    # Create JSON payload for update
    echo "Updating $FILE_PATH..."
    RESPONSE=$(curl -s -X PUT \
      -H "Authorization: token $GITHUB_TOKEN" \
      -d "{\"message\":\"$COMMIT_MESSAGE\",\"content\":\"$CONTENT\",\"sha\":\"$SHA\",\"branch\":\"$BRANCH\"}" \
      "$BASE_URL/$FILE_PATH")
    
    if echo "$RESPONSE" | grep -q "content"; then
      echo "✓ Successfully updated $FILE_PATH"
    else
      echo "✗ Failed to update $FILE_PATH"
      echo "$RESPONSE" | grep -o '"message": *"[^"]*"' | sed 's/"message": *"//;s/"//g'
    fi
  else
    # File doesn't exist, create it
    echo "File doesn't exist, creating $FILE_PATH..."
    CONTENT=$(base64 -w 0 "$FILE_PATH")
    
    RESPONSE=$(curl -s -X PUT \
      -H "Authorization: token $GITHUB_TOKEN" \
      -d "{\"message\":\"Create $FILE_PATH\",\"content\":\"$CONTENT\",\"branch\":\"$BRANCH\"}" \
      "$BASE_URL/$FILE_PATH")
    
    if echo "$RESPONSE" | grep -q "content"; then
      echo "✓ Successfully created $FILE_PATH"
    else
      echo "✗ Failed to create $FILE_PATH"
      echo "$RESPONSE" | grep -o '"message": *"[^"]*"' | sed 's/"message": *"//;s/"//g'
    fi
  fi
}

# List of files to update
FILES=(
  "src/components/SiteProtectionWrapper.tsx"
  "src/context/PasswordContext.tsx"
  "src/app/layout.tsx"
  "src/app/clear-auth/page.tsx"
  "src/app/api/auth/[...nextauth]/route.ts"
)

# Main execution
echo "Starting GitHub file updates..."

for FILE in "${FILES[@]}"; do
  if [ -f "$FILE" ]; then
    update_file "$FILE"
  else
    echo "✗ Local file not found: $FILE"
  fi
done

echo "Update process completed"