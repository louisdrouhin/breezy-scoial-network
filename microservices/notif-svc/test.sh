#!/bin/bash

BASE_URL="http://localhost:3004"
API_URL="$BASE_URL/api/notifs"
INTERNAL_API_KEY="${INTERNAL_API_KEY:-test-key-123}"

echo "=== Testing notif-svc routes ==="
echo

# Test 1: Health check
echo "1. GET /api/health (public)"
curl -X GET "$BASE_URL/api/health" \
  -H "Content-Type: application/json"
echo -e "\n"

# Test 2: Create notifications (internal route)
echo "2. POST /api/notifs (create notifs - internal)"
NOTIF_1=$(curl -s -X POST "$API_URL" \
  -H "Content-Type: application/json" \
  -H "X-Internal-API-Key: $INTERNAL_API_KEY" \
  -d '{
    "type": "MENTION",
    "recipientUsername": "john",
    "actorUsername": "jane",
    "relatedPostId": "123"
  }')
echo "$NOTIF_1"
NOTIF_ID=$(echo "$NOTIF_1" | grep -o '"_id":"[^"]*' | head -1 | cut -d'"' -f4)
echo "Created notification ID: $NOTIF_ID"
echo -e "\n"

# Test 3: Create another notification
echo "3. Create second notification (like)"
NOTIF_2=$(curl -s -X POST "$API_URL" \
  -H "Content-Type: application/json" \
  -H "X-Internal-API-Key: $INTERNAL_API_KEY" \
  -d '{
    "type": "LIKE",
    "recipientUsername": "john",
    "actorUsername": "jane",
    "relatedPostId": "456"
  }')
echo "$NOTIF_2"
echo -e "\n"

# Test 4: Get all notifications for user
echo "4. GET /api/notifs (get notifs for john)"
curl -X GET "$API_URL" \
  -H "Content-Type: application/json" \
  -H "X-User-Username: john" \
  -H "X-User-Role: user"
echo -e "\n"

# Test 5: Mark one notification as read
echo "5. PATCH /api/notifs/:id/read (mark as read)"
if [ ! -z "$NOTIF_ID" ]; then
  curl -X PATCH "$API_URL/$NOTIF_ID/read" \
    -H "Content-Type: application/json" \
    -H "X-User-Username: john"
else
  echo "Skipped - no notification ID available"
fi
echo -e "\n"

# Test 6: Get notifications again (should show updated read status)
echo "6. GET /api/notifs (should show read status updated)"
curl -X GET "$API_URL" \
  -H "Content-Type: application/json" \
  -H "X-User-Username: john" \
  -H "X-User-Role: user"
echo -e "\n"

# Test 7: Mark all as read
echo "7. PATCH /api/notifs/read-all (mark all as read)"
curl -X PATCH "$API_URL/read-all" \
  -H "Content-Type: application/json" \
  -H "X-User-Username: john"
echo -e "\n"

# Test 8: Get notifications final state
echo "8. GET /api/notifs (all should be read)"
curl -X GET "$API_URL" \
  -H "Content-Type: application/json" \
  -H "X-User-Username: john" \
  -H "X-User-Role: user"
echo -e "\n"

echo "=== Tests complete ==="
