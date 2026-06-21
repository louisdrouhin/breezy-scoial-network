#!/bin/bash

BASE_URL="http://localhost:3005"
API_URL="$BASE_URL/api/feed"

echo "=== Testing feed-svc routes ==="
echo

# Test 1: Health check
echo "1. GET /api/health (public)"
curl -X GET "$BASE_URL/api/health" \
  -H "Content-Type: application/json"
echo -e "\n"

# Test 2: Get feed for user (requires following users)
echo "2. GET /api/feed (get chronological feed for john)"
curl -X GET "$API_URL?page=1&limit=20" \
  -H "Content-Type: application/json" \
  -H "X-User-Username: john"
echo -e "\n"

# Test 3: Get feed for another user
echo "3. GET /api/feed (get feed for jane)"
curl -X GET "$API_URL?page=1&limit=20" \
  -H "Content-Type: application/json" \
  -H "X-User-Username: jane"
echo -e "\n"

echo "=== Tests complete ==="
echo "Note: Feed contains posts from users you follow, sorted by date (fan-out on read)"
