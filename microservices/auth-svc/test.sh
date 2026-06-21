#!/bin/bash

BASE_URL="http://localhost:3001"
API_URL="$BASE_URL/api/auth"

echo "=== Testing auth-svc routes ==="
echo

# Test 1: Health check
echo "1. GET /api/health (public)"
curl -X GET "$BASE_URL/api/health" \
  -H "Content-Type: application/json"
echo -e "\n"

# Test 2: Register a user
echo "2. POST /api/auth/register"
REGISTER=$(curl -s -X POST "$API_URL/register" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "testuser@example.com",
    "password": "SecurePassword123"
  }')
echo "$REGISTER"
echo -e "\n"

# Test 3: Login
echo "3. POST /api/auth/login"
LOGIN=$(curl -s -X POST "$API_URL/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "testuser@example.com",
    "password": "SecurePassword123"
  }')
echo "$LOGIN"
TOKEN=$(echo "$LOGIN" | grep -o '"token":"[^"]*' | head -1 | cut -d'"' -f4)
echo "Token: $TOKEN"
echo -e "\n"

# Test 4: Validate token
echo "4. GET /api/auth/validate"
if [ ! -z "$TOKEN" ]; then
  curl -X GET "$API_URL/validate" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $TOKEN"
else
  echo "Skipped - no token available"
fi
echo -e "\n"

echo "=== Tests complete ==="
