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

# Set up git config first
git config --global user.email "user@replit.com"
git config --global user.name "Replit User"

echo "Starting upload of modified files..."

# Function to check if the GitHub token is set
check_token() {
  if [ -z "$GITHUB_TOKEN" ]; then
    echo "Error: GITHUB_TOKEN is not set. Please set it as an environment variable."
    exit 1
  fi
}

# Function to get the current SHA of a file in the repo
get_file_sha() {
  local file_path=$1
  curl -s -H "Authorization: token ${GITHUB_TOKEN}" \
       -H "Accept: application/vnd.github.v3+json" \
       "https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${file_path}?ref=${BRANCH}" | \
  grep -o '"sha":"[^"]*"' | sed 's/"sha":"//;s/"//'
}

# Function to update a file in the repo
update_file() {
  local file_path=$1
  local file_sha=$2
  
  # Encode file content to base64
  local encoded_content=$(base64 -w 0 "$file_path")
  
  # Create temporary JSON payload file
  local temp_file="github-payload-$(date +%s).json"
  cat > "$temp_file" << EOF
{
  "message": "Update ${file_path}",
  "content": "${encoded_content}",
  "sha": "${file_sha}",
  "branch": "${BRANCH}"
}
EOF
  
  # Upload to GitHub
  echo "Updating ${file_path}..."
  local result=$(curl -s -X PUT \
    -H "Authorization: token ${GITHUB_TOKEN}" \
    -H "Accept: application/vnd.github.v3+json" \
    -d @"$temp_file" \
    "https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${file_path}")
  
  # Check for errors
  if echo "$result" | grep -q '"message":"Bad credentials"'; then
    echo "Error: Authentication failed. Check your GitHub token."
    rm "$temp_file"
    exit 1
  elif echo "$result" | grep -q '"message":"Not Found"'; then
    echo "Error: Repository or file not found. Check your repository details."
    rm "$temp_file"
    exit 1
  elif echo "$result" | grep -q "message.*error"; then
    echo "Error updating $file_path:"
    echo "$result" | grep -o '"message":"[^"]*"' | sed 's/"message":"//;s/"//'
  else
    echo "✓ Successfully updated $file_path"
  fi
  
  # Clean up
  rm "$temp_file"
}

# Main execution
check_token

# Process each file
for file in "${FILES[@]}"; do
  if [ -f "$file" ]; then
    file_sha=$(get_file_sha "$file")
    if [ -n "$file_sha" ]; then
      update_file "$file" "$file_sha"
    else
      echo "Could not get SHA for $file. Skipping."
    fi
  else
    echo "File $file does not exist. Skipping."
  fi
done

echo "Update process completed."