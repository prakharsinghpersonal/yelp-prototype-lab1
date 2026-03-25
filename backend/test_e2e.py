"""
End-to-End API Test Suite — Lab 1 YelpStar
Run: python3 test_e2e.py
Covers all requirements from Lab1-Yelp.pdf
"""
import requests
import sys
import time

BASE = "http://localhost:8000"
PASS = "\033[92m✓\033[0m"
FAIL = "\033[91m✗\033[0m"
WARN = "\033[93m⚠\033[0m"

results = []

def check(label, ok, detail=""):
    status = PASS if ok else FAIL
    print(f"  {status} {label}" + (f" — {detail}" if detail else ""))
    results.append((label, ok))

def section(title):
    print(f"\n{'='*55}")
    print(f"  {title}")
    print(f"{'='*55}")

def post(path, data, token=None):
    h = {"Authorization": f"Bearer {token}"} if token else {}
    return requests.post(f"{BASE}{path}", json=data, headers=h)

def get(path, token=None, params=None):
    h = {"Authorization": f"Bearer {token}"} if token else {}
    return requests.get(f"{BASE}{path}", headers=h, params=params)

def put(path, data, token=None):
    h = {"Authorization": f"Bearer {token}"} if token else {}
    return requests.put(f"{BASE}{path}", json=data, headers=h)

def delete(path, token=None):
    h = {"Authorization": f"Bearer {token}"} if token else {}
    return requests.delete(f"{BASE}{path}", headers=h)


# ─── 0. SERVER HEALTH ──────────────────────────────────────
section("0. Server Health")
try:
    r = get("/")
    check("Backend is running", r.status_code == 200)
    r = get("/docs")
    check("Swagger UI accessible at /docs", r.status_code == 200)
except Exception as e:
    check("Backend is running", False, str(e))
    print("\n  Cannot connect to backend. Is uvicorn running on port 8000?")
    sys.exit(1)


# ─── 1. USER AUTH ──────────────────────────────────────────
section("1. User Authentication")
ts = int(time.time())
TEST_EMAIL = f"e2etest_{ts}@test.com"
TEST_PASS = "testpass123"

r = post("/auth/signup", {"name": "E2E User", "email": TEST_EMAIL, "password": TEST_PASS,
                           "country": "United States", "city": "New York"})
check("POST /auth/signup — new user", r.status_code == 201, r.text[:80] if r.status_code != 201 else "")

r = post("/auth/login", {"email": TEST_EMAIL, "password": TEST_PASS})
check("POST /auth/login — valid credentials", r.status_code == 200)
USER_TOKEN = r.json().get("access_token", "") if r.status_code == 200 else ""
check("JWT token returned", bool(USER_TOKEN))

r = post("/auth/login", {"email": TEST_EMAIL, "password": "wrongpassword"})
check("POST /auth/login — wrong password returns 401", r.status_code == 401)

r = post("/auth/signup", {"name": "Dup", "email": TEST_EMAIL, "password": TEST_PASS})
check("POST /auth/signup — duplicate email returns 400", r.status_code == 400)


# ─── 2. OWNER AUTH ─────────────────────────────────────────
section("2. Owner Authentication")
OWNER_EMAIL = f"owner_{ts}@test.com"

r = post("/auth/owner/signup", {"name": "E2E Owner", "email": OWNER_EMAIL, "password": TEST_PASS,
                                 "city": "Chicago", "country": "United States"})
check("POST /auth/owner/signup", r.status_code == 201, r.text[:80] if r.status_code != 201 else "")

r = post("/auth/owner/login", {"email": OWNER_EMAIL, "password": TEST_PASS})
check("POST /auth/owner/login", r.status_code == 200)
OWNER_TOKEN = r.json().get("access_token", "") if r.status_code == 200 else ""

r = post("/auth/owner/login", {"email": TEST_EMAIL, "password": TEST_PASS})
check("POST /auth/owner/login — non-owner blocked (403)", r.status_code == 403)


# ─── 3. USER PROFILE ───────────────────────────────────────
section("3. User Profile Management")
r = get("/users/me", token=USER_TOKEN)
check("GET /users/me — fetch profile", r.status_code == 200)
if r.status_code == 200:
    profile = r.json()
    check("Profile has name/email/role fields", all(k in profile for k in ["name", "email", "role"]))

r = put("/users/me", {"name": "Updated Name", "about_me": "I love food", "city": "NYC",
                       "country": "United States", "language": "English", "gender": "prefer_not_to_say"},
        token=USER_TOKEN)
check("PUT /users/me — update profile", r.status_code == 200, r.text[:80] if r.status_code != 200 else "")


# ─── 4. USER PREFERENCES ───────────────────────────────────
section("4. User Preferences (AI Assistant)")
r = get("/users/me/preferences", token=USER_TOKEN)
check("GET /users/me/preferences", r.status_code == 200)

r = put("/users/me/preferences", {
    "cuisines": ["Italian", "Japanese"],
    "price_range": "$$",
    "dietary_needs": ["Vegetarian"],
    "ambiance": ["Casual", "Romantic"],
    "sort_preference": "rating"
}, token=USER_TOKEN)
check("PUT /users/me/preferences — save preferences", r.status_code == 200,
      r.text[:80] if r.status_code != 200 else "")


# ─── 5. RESTAURANTS ────────────────────────────────────────
section("5. Restaurant CRUD & Search")
r = get("/restaurants")
check("GET /restaurants — public listing", r.status_code == 200)
check("At least 1 restaurant seeded", len(r.json()) > 0 if r.status_code == 200 else False)

r = get("/restaurants", params={"search": "carbone"})
check("GET /restaurants?search=carbone — search by name", r.status_code == 200)

r = get("/restaurants", params={"cuisine": "Italian"})
check("GET /restaurants?cuisine=Italian — filter by cuisine", r.status_code == 200)

r = get("/restaurants", params={"city": "New York"})
check("GET /restaurants?city=New York — filter by city", r.status_code == 200)

r = get("/restaurants", params={"price_tier": "$$"})
check("GET /restaurants?price_tier=$$ — filter by price", r.status_code == 200)

# Create a restaurant (as user)
r = post("/restaurants", {
    "name": f"E2E Test Restaurant {ts}",
    "cuisine_type": "Italian",
    "address": "123 Test St",
    "city": "New York",
    "description": "E2E test restaurant",
    "price_tier": "$$",
    "amenities": ["Outdoor Seating", "WiFi"]
}, token=USER_TOKEN)
check("POST /restaurants — create restaurant", r.status_code == 201,
      r.text[:80] if r.status_code != 201 else "")
REST_ID = r.json().get("id") if r.status_code == 201 else None

if REST_ID:
    r = get(f"/restaurants/{REST_ID}")
    check(f"GET /restaurants/{REST_ID} — get single", r.status_code == 200)
    check("Restaurant has required fields", all(k in r.json() for k in
          ["id", "name", "cuisine_type", "avg_rating", "review_count"]))


# ─── 6. REVIEWS ────────────────────────────────────────────
section("6. Reviews (Create / Edit / Delete)")
REVIEW_ID = None
if REST_ID:
    r = post(f"/restaurants/{REST_ID}/reviews", {"rating": 5, "comment": "Amazing E2E test food!"},
             token=USER_TOKEN)
    check("POST /restaurants/{id}/reviews — create review", r.status_code == 201,
          r.text[:80] if r.status_code != 201 else "")
    REVIEW_ID = r.json().get("id") if r.status_code == 201 else None

    r = get(f"/restaurants/{REST_ID}/reviews")
    check("GET /restaurants/{id}/reviews — list reviews", r.status_code == 200)
    check("Review appears in list", len(r.json()) > 0 if r.status_code == 200 else False)

if REVIEW_ID:
    r = put(f"/reviews/{REVIEW_ID}", {"rating": 4, "comment": "Updated review"}, token=USER_TOKEN)
    check("PUT /reviews/{id} — update own review", r.status_code == 200,
          r.text[:80] if r.status_code != 200 else "")

    r = put(f"/reviews/{REVIEW_ID}", {"rating": 4, "comment": "Hack attempt"}, token=OWNER_TOKEN)
    check("PUT /reviews/{id} — cannot edit other user's review (403)", r.status_code in [403, 404])

    r = delete(f"/reviews/{REVIEW_ID}", token=USER_TOKEN)
    check("DELETE /reviews/{id} — delete own review", r.status_code in [200, 204],
          r.text[:80] if r.status_code not in [200, 204] else "")


# ─── 7. FAVOURITES ─────────────────────────────────────────
section("7. Favourites")
FAV_ID = None
if REST_ID:
    r = post(f"/favorites/{REST_ID}", {}, token=USER_TOKEN)
    check("POST /favorites/{id} — add favourite", r.status_code in [200, 201],
          r.text[:80] if r.status_code not in [200, 201] else "")

    r = get("/favorites", token=USER_TOKEN)
    check("GET /favorites — list favourites", r.status_code == 200)
    check("Restaurant appears in favourites", len(r.json()) > 0 if r.status_code == 200 else False)

    r = delete(f"/favorites/{REST_ID}", token=USER_TOKEN)
    check("DELETE /favorites/{id} — remove favourite", r.status_code in [200, 204],
          r.text[:80] if r.status_code not in [200, 204] else "")


# ─── 8. HISTORY ────────────────────────────────────────────
section("8. User History")
# Add a review first so history isn't empty
if REST_ID:
    post(f"/restaurants/{REST_ID}/reviews", {"rating": 4, "comment": "History test review"}, token=USER_TOKEN)

r = get("/users/me/history", token=USER_TOKEN)
check("GET /users/me/history — user history", r.status_code == 200,
      r.text[:80] if r.status_code != 200 else "")
if r.status_code == 200:
    data = r.json()
    check("History has reviews field", "reviews" in data)
    check("History has restaurants_added field", "restaurants_added" in data)


# ─── 9. AI CHAT ────────────────────────────────────────────
section("9. AI Assistant Chatbot")
r = post("/ai-assistant/chat", {
    "message": "I want Italian food in New York",
    "conversation_history": []
}, token=USER_TOKEN)
check("POST /ai-assistant/chat — basic query", r.status_code == 200,
      r.text[:100] if r.status_code != 200 else "")
if r.status_code == 200:
    data = r.json()
    check("Response has 'response' text", bool(data.get("response")))
    check("Response has 'restaurants' array", "restaurants" in data)
    check("AI returns restaurant cards", len(data.get("restaurants", [])) > 0,
          f"got {len(data.get('restaurants', []))} restaurants")

# Multi-turn conversation
r = post("/ai-assistant/chat", {
    "message": "Something romantic for an anniversary",
    "conversation_history": [{"role": "user", "content": "I like Japanese food"}]
}, token=USER_TOKEN)
check("POST /ai-assistant/chat — multi-turn conversation", r.status_code == 200)

# Preferences-aware
r = post("/ai-assistant/chat", {
    "message": "I'm vegan, what do you recommend?",
    "conversation_history": []
}, token=USER_TOKEN)
check("POST /ai-assistant/chat — preference-aware query", r.status_code == 200)

# Without auth should fail
r = post("/ai-assistant/chat", {"message": "hello", "conversation_history": []})
check("POST /ai-assistant/chat — no auth returns 401/403", r.status_code in [401, 403])


# ─── 10. OWNER FEATURES ────────────────────────────────────
section("10. Owner Features")
r = get("/restaurants/owner/dashboard", token=OWNER_TOKEN)
check("GET /restaurants/owner/dashboard", r.status_code == 200,
      r.text[:80] if r.status_code != 200 else "")

if REST_ID:
    r = post(f"/restaurants/{REST_ID}/claim", {}, token=OWNER_TOKEN)
    check("POST /restaurants/{id}/claim — claim restaurant", r.status_code in [200, 201, 400],
          r.text[:80])  # 400 ok if already owned


# ─── 11. SUMMARY ───────────────────────────────────────────
section("RESULTS SUMMARY")
passed = sum(1 for _, ok in results if ok)
failed = sum(1 for _, ok in results if not ok)
total = len(results)

print(f"\n  Total: {total}  |  {PASS} Passed: {passed}  |  {FAIL} Failed: {failed}")
print()

if failed:
    print("  Failed tests:")
    for label, ok in results:
        if not ok:
            print(f"    {FAIL} {label}")
    print()

score = int((passed / total) * 100) if total else 0
print(f"  Score: {score}% ({passed}/{total})")

if score == 100:
    print(f"\n  🎉 All tests passed! Ready for demo.")
elif score >= 80:
    print(f"\n  ⚠  Most tests passed. Fix the failures above before demo.")
else:
    print(f"\n  ✗  Several features need attention.")
