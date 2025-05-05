#!/bin/bash

# Create the file data in base64
ENCODED_CONTENT=$(base64 -w 0 src/app/clear-auth/page.tsx)

# Create a JSON file with properly escaped content
cat > github-payload.json << EOF
{
  "message": "Add clear-auth page to reset site authentication",
  "content": "${ENCODED_CONTENT}",
  "branch": "main"
}
EOF

# Use the GitHub API to create the file
curl -X PUT \
  -H "Authorization: token ${GITHUB_TOKEN}" \
  -H "Accept: application/vnd.github.v3+json" \
  -d @github-payload.json \
  "https://api.github.com/repos/jbishop216/littlegabriel2/contents/src/app/clear-auth/page.tsx"

echo -e "\nFile update attempted via GitHub API"