#!/bin/bash

BASE_URL="http://localhost:3003"
API_URL="$BASE_URL/api/posts"
INTERNAL_API_KEY="${INTERNAL_API_KEY:-test-key-123}"

echo "=== Testing post-svc routes ==="
echo

# Test 1: Health check
echo "1. GET /api/health (public)"
curl -X GET "$BASE_URL/api/health" \
  -H "Content-Type: application/json"
echo -e "\n"

# Test 2: Create a post
echo "2. POST /api/posts (create post)"
POST_1=$(curl -s -X POST "$API_URL" \
  -H "Content-Type: application/json" \
  -H "X-User-Username: john" \
  -d '{
    "content": "This is my first post! #breezy",
    "tags": ["breezy", "first"]
  }')
echo "$POST_1"
POST_ID=$(echo "$POST_1" | grep -o '"_id":"[^"]*' | head -1 | cut -d'"' -f4)
echo "Created post ID: $POST_ID"
echo -e "\n"

# Test 3: Get the post
echo "3. GET /api/posts/:id"
if [ ! -z "$POST_ID" ]; then
  curl -X GET "$API_URL/$POST_ID" \
    -H "Content-Type: application/json"
else
  echo "Skipped - no post ID available"
fi
echo -e "\n"

# Test 4: Create a reply (comment)
echo "4. POST /api/posts (create reply/comment)"
if [ ! -z "$POST_ID" ]; then
  REPLY=$(curl -s -X POST "$API_URL" \
    -H "Content-Type: application/json" \
    -H "X-User-Username: jane" \
    -d "{
      \"content\": \"Great post!\",
      \"parentId\": \"$POST_ID\"
    }")
  echo "$REPLY"
  REPLY_ID=$(echo "$REPLY" | grep -o '"_id":"[^"]*' | head -1 | cut -d'"' -f4)
else
  echo "Skipped - no post ID available"
fi
echo -e "\n"

# Test 5: Get replies
echo "5. GET /api/posts/:id/replies"
if [ ! -z "$POST_ID" ]; then
  curl -X GET "$API_URL/$POST_ID/replies?page=1&limit=10" \
    -H "Content-Type: application/json"
else
  echo "Skipped - no post ID available"
fi
echo -e "\n"

# Test 6: Get posts by username
echo "6. GET /api/posts/user/:username"
curl -X GET "$API_URL/user/john?page=1&limit=10" \
  -H "Content-Type: application/json"
echo -e "\n"

# Test 7: Like a post
echo "7. POST /api/posts/:id/like"
if [ ! -z "$POST_ID" ]; then
  curl -X POST "$API_URL/$POST_ID/like" \
    -H "Content-Type: application/json" \
    -H "X-User-Username: jane"
else
  echo "Skipped - no post ID available"
fi
echo -e "\n"

# Test 8: Get posts by tag
echo "8. GET /api/posts/tags/:tag"
curl -X GET "$API_URL/tags/breezy?page=1&limit=10" \
  -H "Content-Type: application/json"
echo -e "\n"

# Test 9: Unlike a post
echo "9. DELETE /api/posts/:id/like"
if [ ! -z "$POST_ID" ]; then
  curl -X DELETE "$API_URL/$POST_ID/like" \
    -H "Content-Type: application/json" \
    -H "X-User-Username: jane"
else
  echo "Skipped - no post ID available"
fi
echo -e "\n"

# Test 10: Delete post
echo "10. DELETE /api/posts/:id"
if [ ! -z "$POST_ID" ]; then
  curl -X DELETE "$API_URL/$POST_ID" \
    -H "Content-Type: application/json" \
    -H "X-User-Username: john"
else
  echo "Skipped - no post ID available"
fi
echo -e "\n"

echo "=== Tests complete ==="
