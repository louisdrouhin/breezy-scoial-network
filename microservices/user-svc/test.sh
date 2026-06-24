#!/bin/bash

BASE_URL="http://localhost:3002"
API_URL="$BASE_URL/api/users"
INTERNAL_URL="$BASE_URL/api/internal/users"
INTERNAL_API_KEY="${INTERNAL_API_KEY:-test-key-123}"

echo "=== Testing user-svc routes ==="
echo

# Step 1: Create profiles (internal route)
echo "0. Create profiles (internal route)"
curl -X POST "$INTERNAL_URL/create" \
  -H "Content-Type: application/json" \
  -H "X-Internal-API-Key: $INTERNAL_API_KEY" \
  -d '{
    "username": "john",
    "displayName": "John Doe",
    "bio": "Software engineer",
    "avatarUrl": "https://example.com/john.jpg"
  }'
echo -e "\n"

curl -X POST "$INTERNAL_URL/create" \
  -H "Content-Type: application/json" \
  -H "X-Internal-API-Key: $INTERNAL_API_KEY" \
  -d '{
    "username": "jane",
    "displayName": "Jane Smith"
  }'
echo -e "\n"

# Wait for database to process
sleep 1

# Test 1: Get public profile
echo "1. GET /api/users/:username (public profile)"
curl -X GET "$API_URL/john" \
  -H "Content-Type: application/json"
echo -e "\n"

# Test 2: Get my profile (with auth header)
echo "2. GET /api/users/me (my profile - requires auth)"
curl -X GET "$API_URL/me" \
  -H "Content-Type: application/json" \
  -H "X-User-Username: john"
echo -e "\n"

# Test 3: Update my profile
echo "3. PATCH /api/users/me (update profile)"
curl -X PATCH "$API_URL/me" \
  -H "Content-Type: application/json" \
  -H "X-User-Username: john" \
  -d '{
    "bio": "Updated bio"
  }'
echo -e "\n"

# Test 4: Get followers
echo "4. GET /api/users/:username/followers"
curl -X GET "$API_URL/john/followers" \
  -H "Content-Type: application/json"
echo -e "\n"

# Test 5: Get following
echo "5. GET /api/users/:username/following"
curl -X GET "$API_URL/john/following" \
  -H "Content-Type: application/json"
echo -e "\n"

# Test 6: Follow a user
echo "6. POST /api/users/:username/follow"
curl -X POST "$API_URL/jane/follow" \
  -H "Content-Type: application/json" \
  -H "X-User-Username: john"
echo -e "\n"

# Test 7: Check followers of jane
echo "7. GET /api/users/jane/followers (should show john)"
curl -X GET "$API_URL/jane/followers" \
  -H "Content-Type: application/json"
echo -e "\n"

# Test 8: Unfollow a user
echo "8. DELETE /api/users/:username/follow"
curl -X DELETE "$API_URL/jane/follow" \
  -H "Content-Type: application/json" \
  -H "X-User-Username: john"
echo -e "\n"

# Test 9: Check followers of jane again (should be empty)
echo "9. GET /api/users/jane/followers (should be empty now)"
curl -X GET "$API_URL/jane/followers" \
  -H "Content-Type: application/json"
echo -e "\n"

echo "=== Tests complete ==="
