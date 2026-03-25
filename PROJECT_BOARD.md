# 🍽️ Yelp Prototype — Lab 1 Task Tracker

> **Due:** March 24, 2026 · 11:59 PM · **Points:** 40  
> **Stack:** React · FastAPI · MySQL · Langchain · Tavily  
> **Repo:** [github.com/prakharsinghpersonal/yelp-prototype-lab1](https://github.com/prakharsinghpersonal/yelp-prototype-lab1)

---

## Team Roles

| Member | Role |
|---|---|
| **Prakhar Singh** | Backend (FastAPI + MySQL), AI Chatbot (Langchain + Tavily), API Docs |
| **Nikhil Khaneja** | Frontend (React), All UI Pages, Chat UI, Responsive Styling |

---

## EPIC 1 — Project Setup & Infrastructure

| ✓ | Task | Owner | Notes |
|---|---|---|---|
| ✅ | Create private GitHub repo | Prakhar | `yelp-prototype-lab1` |
| ✅ | Add `.gitignore` (Python + Node) | Prakhar | Done |
| ✅ | MySQL database — all tables with FK & indexes | Prakhar | `users`, `restaurants`, `reviews`, `photos`, `favorites`, `user_preferences` |
| ✅ | `.env` setup — DB, JWT, Google AI, Tavily keys | Prakhar | `.env.example` in repo |
| ✅ | Backend structure — routes, models, services, db | Prakhar | All route files created |
| ✅ | Seed sample data — 3 users, 6 restaurants, 7 reviews | Prakhar | Run `python db/seed.py` |
| ☐ | React app scaffold (`frontend/`) — `components/`, `pages/`, `services/` | Nikhil | Use Vite or CRA |

---

## EPIC 2 — User Authentication

| ✓ | Task | Owner | Acceptance Criteria |
|---|---|---|---|
| ✅ | `POST /auth/signup` — name, email, password | Prakhar | Password hashed with bcrypt. Rejects duplicate email |
| ✅ | `POST /auth/login` — returns JWT token | Prakhar | Valid creds → JWT. Invalid → 401 |
| ✅ | JWT middleware for protected routes | Prakhar | Unauth requests → 401 |
| ☐ | `POST /auth/logout` — invalidate token | Prakhar | Token blacklisted or session destroyed |
| ☐ | Signup Page — form with validation | Nikhil | Validates fields, email format, password strength |
| ☐ | Login Page — form with JWT storage | Nikhil | JWT in localStorage. Redirects to dashboard |
| ☐ | Logout — clear token, redirect | Nikhil | Token cleared, redirect to login |

---

## EPIC 3 — User Profile & Preferences

| ✓ | Task | Owner | Acceptance Criteria |
|---|---|---|---|
| ✅ | `GET /users/me` — return profile | Prakhar | Returns all profile fields |
| ✅ | `PUT /users/me` — update profile | Prakhar | All fields updatable |
| ✅ | `POST /users/me/photo` — upload profile pic | Prakhar | Accepts image, stores, returns URL |
| ✅ | `GET /users/me/preferences` — get prefs | Prakhar | Returns cuisine, price, location, dietary, ambiance, sort |
| ✅ | `PUT /users/me/preferences` — save prefs | Prakhar | Saves all preference fields |
| ☐ | Profile Page — display & edit all fields | Nikhil | Country dropdown, state abbreviated, profile pic upload |
| ☐ | Preferences Editor — config panel | Nikhil | Multi-select cuisines, price slider, dietary checkboxes |

---

## EPIC 4 — Restaurant Management

| ✓ | Task | Owner | Acceptance Criteria |
|---|---|---|---|
| ✅ | `POST /restaurants` — create listing | Prakhar | All fields: name, cuisine, address, city, etc. |
| ✅ | `GET /restaurants` — list + search | Prakhar | Search by name, cuisine, keywords, city/zip. Pagination |
| ✅ | `GET /restaurants/{id}` — single restaurant | Prakhar | Returns all details + increments view count |
| ✅ | `PUT /restaurants/{id}` — update | Prakhar | Creator/owner only |
| ✅ | `DELETE /restaurants/{id}` — delete | Prakhar | Creator/owner only |
| ✅ | `POST /restaurants/{id}/photos` — upload photos | Prakhar | Multiple photos per restaurant |
| ☐ | `GET /restaurants/{id}/photos` — get photos | Prakhar | Returns photo URL list (included in detail response) |
| ☐ | Explore/Search Page — main landing | Nikhil | Search bar + filters, restaurant cards grid, responsive |
| ☐ | Restaurant Details Page | Nikhil | All info + reviews + photo gallery |
| ☐ | Add Restaurant Form | Nikhil | Validation + photo upload + success/error feedback |

---

## EPIC 5 — Reviews, Favorites & History

| ✓ | Task | Owner | Acceptance Criteria |
|---|---|---|---|
| ✅ | `POST /restaurants/{id}/reviews` — create review | Prakhar | Rating 1–5, comment, server date |
| ✅ | `GET /restaurants/{id}/reviews` — list all | Prakhar | Returns reviews with user info |
| ✅ | `PUT /reviews/{id}` — update own only | Prakhar | Author only → 403 for others |
| ✅ | `DELETE /reviews/{id}` — delete own only | Prakhar | Author only → 403 for others |
| ✅ | `POST /favorites/{restaurant_id}` — add | Prakhar | Marks as favorite |
| ✅ | `DELETE /favorites/{restaurant_id}` — remove | Prakhar | Removes favorite |
| ✅ | `GET /favorites` — list favorites | Prakhar | Returns restaurant details |
| ✅ | `GET /users/me/history` — activity history | Prakhar | Past reviews + restaurants added |
| ☐ | Write Review Form | Nikhil | Interactive stars, comment, photo, edit/delete own |
| ☐ | Favorites Tab | Nikhil | Restaurant cards + unfavorite button |
| ☐ | History Tab | Nikhil | Chronological reviews + restaurants added |

---

## EPIC 6 — AI Assistant Chatbot

| ✓ | Task | Owner | Acceptance Criteria |
|---|---|---|---|
| ✅ | `POST /ai-assistant/chat` endpoint | Prakhar | Input: `{message, conversation_history}`, Output: JSON recs |
| ✅ | Load user preferences from DB | Prakhar | Fetches cuisine, price, dietary, location, ambiance |
| ✅ | Langchain NLU integration | Prakhar | Google Gemini via langchain-google-genai |
| ✅ | Query restaurant DB with filters | Prakhar | Filters + ranks by relevance |
| ✅ | Tavily web search integration | Prakhar | Additional context for recommendations |
| ✅ | Multi-turn conversation support | Prakhar | Uses `conversation_history` |
| ✅ | Personalized recommendations with reasoning | Prakhar | Explains WHY each restaurant is recommended |
| ✅ | Conversational tone — not robotic | Prakhar | System prompt enforces warm tone |
| ☐ | Chat Window — conversation history | Nikhil | Scrollable, prominent on home screen |
| ☐ | Chat Input + Send button | Nikhil | Text input with send |
| ☐ | Restaurant Recommendation Cards | Nikhil | Name, rating, price, cuisine → clickable |
| ☐ | Loading/Thinking indicator | Nikhil | Spinner while AI processes |
| ☐ | New Conversation / Clear Chat | Nikhil | Resets chat |
| ☐ | (Optional) Quick action buttons | Nikhil | "Find dinner tonight", etc. |

---

## EPIC 7 — Restaurant Owner Features (Stretch)

| ✓ | Task | Owner |
|---|---|---|
| ☐ | Owner Signup/Login APIs | Prakhar |
| ☐ | Owner Profile Management API | Prakhar |
| ☐ | Claim Restaurant API | Prakhar |
| ☐ | Owner View Reviews (read-only) | Prakhar |
| ☐ | Owner Dashboard API — analytics | Prakhar |
| ☐ | Owner Pages (Signup, Profile, Reviews, Analytics) | Nikhil |

---

## EPIC 8 — Documentation & Submission

| ✓ | Task | Owner |
|---|---|---|
| ✅ | `README.md` — setup instructions | Both |
| ✅ | `requirements.txt` — Python deps | Prakhar |
| ☐ | API Docs — Swagger at `/docs` | Prakhar |
| ☐ | Detailed commit messages | Both |
| ☐ | Lab Report — Intro, System Design, AI, Screenshots | Both |
| ☐ | Upload `YourName_Lab1_Report.doc` to Canvas | Both |

---

## Database Schema

| Table | Key Columns |
|---|---|
| `users` | id, name, email, password_hash, phone, about_me, city, country, state, language, gender, profile_pic_url, role, created_at |
| `restaurants` | id, name, cuisine_type, description, address, city, zip, phone, hours, price_tier, amenities, owner_id, avg_rating, review_count, created_at |
| `reviews` | id, user_id, restaurant_id, rating (1–5), comment, created_at, updated_at |
| `photos` | id, restaurant_id, review_id (nullable), url, created_at |
| `favorites` | id, user_id, restaurant_id, created_at |
| `user_preferences` | id, user_id, cuisines (JSON), price_range, location, preferred_locations (JSON), search_radius, dietary_needs (JSON), ambiance (JSON), sort_preference |

---

## Quick Start

```bash
# Backend
cd backend
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env  # edit with your keys
python db/seed.py     # seed sample data
uvicorn main:app --reload

# Swagger: http://localhost:8000/docs
```

---

## Demo Credentials (Seed Data)

| Email | Password | Role |
|---|---|---|
| `prakhar@demo.com` | `password123` | user |
| `nikhil@demo.com` | `password123` | user |
| `owner@demo.com` | `password123` | owner |
