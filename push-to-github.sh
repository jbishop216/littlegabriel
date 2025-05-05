#!/bin/bash

# List of files we know were modified
FILES=(
  "src/components/SiteProtectionWrapper.tsx"
  "src/context/PasswordContext.tsx" 
  "src/app/layout.tsx"
  "src/app/api/auth/[...nextauth]/route.ts"
)

# GitHub repository details
REPO_OWNER="jbishop216"
REPO_NAME="littlegabriel2"
BRANCH="main"

echo "Starting upload of modified files to GitHub..."

# Set up git config
git config --global user.email "user@replit.com"
git config --global user.name "Replit User"

# Function to encode a file path for URL usage
urlencode() {
  local string="$1"
  local length="${#string}"
  local encoded=""
  
  for (( i=0; i<length; i++ )); do
    local c="${string:i:1}"
    case "$c" in
      [a-zA-Z0-9.~_-]) encoded+="$c" ;;
      *) encoded+=$(printf '%%%02X' "'$c") ;;
    esac
  done
  
  echo "$encoded"
}

# Function to upload a file
upload_file() {
  local file="$1"
  local encoded_file=$(urlencode "$file")
  local encoded_content=$(base64 -w 0 "$file")
  
  echo "Uploading $file (URL encoded as: $encoded_file)..."
  
  # First, check if the file exists in the repo to get its SHA
  local repo_api_url="https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${encoded_file}"
  echo "Checking file existence at: $repo_api_url"
  local file_info=$(curl -s -H "Authorization: token ${GITHUB_TOKEN}" \
    -H "Accept: application/vnd.github.v3+json" \
    "$repo_api_url")
  
  # Print file info for debugging
  echo "File info response:"
  echo "$file_info" | head -10
  
  # Extract the SHA if the file exists
  local sha=""
  if [[ "$file_info" == *'"sha"'* ]]; then
    sha=$(echo "$file_info" | grep -o '"sha":[ ]*"[^"]*"' | head -1 | sed 's/"sha":[ ]*"//;s/"//g')
    echo "SHA found: $sha"
  else
    echo "No SHA found, file may not exist in the repository"
  fi
  
  # Create JSON payload for the API request
  local payload_file="github-payload-$(date +%s).json"
  
  if [ -n "$sha" ]; then
    # File exists, update it
    echo "Updating existing file with SHA: $sha"
    cat > "$payload_file" << EOF
{
  "message": "Update ${file}",
  "content": "${encoded_content}",
  "sha": "${sha}",
  "branch": "${BRANCH}"
}
EOF
  else
    # File doesn't exist, create it
    echo "Creating new file (no SHA found)"
    cat > "$payload_file" << EOF
{
  "message": "Add ${file}",
  "content": "${encoded_content}",
  "branch": "${BRANCH}"
}
EOF
  fi
  
  # Make the API request
  echo "Sending API request to update/create file..."
  local update_api_url="https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${file}"
  echo "API URL: $update_api_url"
  local response=$(curl -s -X PUT \
    -H "Authorization: token ${GITHUB_TOKEN}" \
    -H "Accept: application/vnd.github.v3+json" \
    -d @"$payload_file" \
    "$update_api_url")
  
  # Print full response for debugging
  echo "API Response:"
  echo "$response" | head -20
  
  # Check response
  if echo "$response" | grep -q '"content":'; then
    echo "✓ Successfully uploaded $file"
  else
    echo "✗ Failed to upload $file"
    echo "Error message:"
    echo "$response" | grep -o '"message":"[^"]*"' | head -1 | sed 's/"message":"//;s/"//'
  fi
  
  # Clean up
  rm -f "$payload_file"
}

# Main execution
if [ -z "$GITHUB_TOKEN" ]; then
  echo "Error: GitHub token not set. Please set the GITHUB_TOKEN environment variable."
  exit 1
fi

# Process each file
for file in "${FILES[@]}"; do
  if [ -f "$file" ]; then
    upload_file "$file"
  else
    echo "File not found: $file"
  fi
done

echo "Upload process completed."