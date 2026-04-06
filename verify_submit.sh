#!/bin/bash
set -e

# 1. Start the server in the background
cd backend
PYTHONPATH=$PYTHONPATH:$(pwd) python3 -m uvicorn main:app --host 127.0.0.1 --port 8000 &
SERVER_PID=$!

# Wait for server to start
echo "Waiting for server to start..."
timeout 15 bash -c 'until curl -s http://127.0.0.1:8000/health; do sleep 1; done'

# 2. Signup a test user
echo "Signing up test user..."
curl -s -X POST http://127.0.0.1:8000/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"username": "testuser", "email": "test@example.com", "password": "password123"}'

# 3. Login to get a token
echo "Logging in..."
TOKEN=$(curl -s -X POST http://127.0.0.1:8000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "password123"}' | jq -r .access_token)

if [ "$TOKEN" == "null" ] || [ -z "$TOKEN" ]; then
    echo "Failed to get token"
    kill $SERVER_PID
    exit 1
fi

# 4. Create a dummy image
echo "Creating dummy image..."
python3 -c "from PIL import Image; img = Image.new('RGB', (100, 100), color='green'); img.save('test_activity.jpg')"

# 5. Submit activity
echo "Submitting activity..."
RESPONSE=$(curl -s -X POST http://127.0.0.1:8000/activities/submit \
  -H "Authorization: Bearer $TOKEN" \
  -F "activity_type=tree" \
  -F "quantity=10" \
  -F "species_or_wattage=neem" \
  -F "age_or_size=sapling" \
  -F "photo=@test_activity.jpg")

echo "Response: $RESPONSE"

# 6. Cleanup
kill $SERVER_PID
rm test_activity.jpg
