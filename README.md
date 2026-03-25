# Yelp Prototype — Lab 1

A full-stack Yelp-style restaurant discovery and review platform with an AI-powered chatbot assistant.

**Due: March 24, 2026, 11:59 PM · Points: 40**

---

## Changelog (March 21, 2026)

> @Nikhil — please review these updates before starting work.

**Tasks Added:**
- Epic 1: Added "Invite TAs to private repo" (Devdatta1999 & Saurabh2504) — was missing from original tracker
- Epic 5: Added `POST /reviews/{id}/photos` endpoint — lab spec requires optional photo attachment on reviews
- Epic 8: Added explicit filename convention `YourName_Lab1_Report.doc` for Canvas submission

**Reclassifications:**
- Epic 7 (Owner Features): Reclassified from "Optional/Stretch" to **required** — lab spec lists Restaurant Owner as a required persona. Only the Analytics Dashboard remains stretch.

**New Section:**
- Additional Features — 5 bonus features added at the bottom (Map View, Image Optimization, Sentiment Badges, Dark Mode, Elasticsearch). See the table for epic mapping and ownership.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite, TailwindCSS, Axios, React Router v6 |
| Backend | Python 3.10+, FastAPI, SQLAlchemy |
| Database | MySQL 8.0 |
| AI Chatbot | LangChain, Tavily, OpenAI |
| Auth | JWT + bcrypt |

---

## Team

| Member | Role |
|---|---|
| **Prakhar Singh** | Backend (FastAPI + MySQL), AI Chatbot (LangChain + Tavily), API Docs |
| **Nikhil Khaneja** | Frontend (React), All UI Pages, Chat UI, Responsive Styling |

---

## Project Structure

```
├── backend/
│   ├── main.py              # FastAPI entry point, CORS config
│   ├── routes/              # API route handlers
│   ├── models/              # SQLAlchemy ORM models
│   ├── services/            # Business logic layer
│   ├── db/                  # DB connection, schema, migrations
│   ├── .env.example         # Required environment variables
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── components/      # Navbar, RestaurantCard, StarRating, ProtectedRoute
│   │   ├── pages/           # ExplorePage, RestaurantDetailsPage, LoginPage,
│   │   │                    # SignupPage, ProfilePage, AddRestaurantPage,
│   │   │                    # FavoritesPage, HistoryPage, ChatPage
│   │   ├── services/        # api.js (Axios), authService, restaurantService,
│   │   │                    # userService, aiService
│   │   ├── mock/            # Mock data + handlers for frontend-only dev
│   │   └── App.jsx          # Router and route definitions
│   ├── .env.example         # VITE_API_URL, VITE_USE_MOCK
│   ├── tailwind.config.js
│   ├── vite.config.js
│   └── package.json
└── PROJECT_BOARD.md         # Full task tracker with ownership and status
```

---

## Database Schema

| Table | Key Columns |
|---|---|
| **users** | id, name, email, password_hash (bcrypt), phone, about_me, city, country, state, language, gender, profile_pic_url, role, created_at |
| **restaurants** | id, name, cuisine_type, description, address, city, zip, phone, hours, price_tier, amenities, owner_id, avg_rating, review_count, created_at |
| **reviews** | id, user_id, restaurant_id, rating (1–5), comment, created_at (server), updated_at |
| **photos** | id, restaurant_id, review_id (nullable), url, created_at |
| **favorites** | id, user_id, restaurant_id, created_at |
| **user_preferences** | id, user_id, cuisines (JSON), price_range, preferred_locations (JSON), search_radius, dietary_needs (JSON), ambiance (JSON), sort_preference |

---

## Getting Started

### Prerequisites
- Python 3.10+
- Node.js 18+
- MySQL 8.0+

### Backend Setup
```bash
cd backend
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env            # Fill in DB credentials and API keys
uvicorn main:app --reload
```

### Frontend Setup
```bash
cd frontend
npm install
cp .env.example .env            # Set VITE_API_URL=http://localhost:8000
npm run dev                     # Runs on http://localhost:3000
```

### Environment Variables

**Backend (`backend/.env`)**
```
DATABASE_URL=mysql+pymysql://user:password@localhost:3306/yelp_db
SECRET_KEY=your-jwt-secret
OPENAI_API_KEY=your-openai-api-key
TAVILY_API_KEY=your-tavily-api-key
```

**Frontend (`frontend/.env`)**
```
VITE_API_URL=http://localhost:8000
VITE_USE_MOCK=false       # Set to true to run frontend without a backend
```

### Frontend Mock Mode (no backend required)

To preview and test the UI without the backend running:

```bash
cd frontend
# In your .env set: VITE_USE_MOCK=true
npm run dev
```

Mock mode intercepts all API calls and returns local sample data — 8 restaurants, reviews, favorites, user profile, preferences, and simulated AI chat responses. Set `VITE_USE_MOCK=false` when integrating with the real backend.

---

## API Documentation

Once the backend is running, visit:
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

---

## Frontend Pages

| Page | Route | Access |
|---|---|---|
| Explore / Search | `/` | Public |
| Restaurant Details | `/restaurants/:id` | Public |
| Sign Up | `/signup` | Public |
| Log In | `/login` | Public |
| Profile + Preferences | `/profile` | Logged in |
| Add Restaurant | `/add-restaurant` | Logged in |
| Favorites | `/favorites` | Logged in |
| History | `/history` | Logged in |
| AI Chat | `/chat` | Logged in |

---

## Branch Strategy

| Branch | Owner | Purpose |
|---|---|---|
| `main` | Both | Stable, reviewed code only |
| `nikhil/frontend` | Nikhil | All frontend work — merge via PR |
| `prakhar/backend` | Prakhar | All backend work — merge via PR |

---

## Epic Breakdown & Task Tracker

### EPIC 1 — Project Setup & Infrastructure

| Status | Task | Owner | Notes |
|---|---|---|---|
| ✅ | Create private GitHub repo | Prakhar | Done — yelp-prototype-lab1 |
| ✅ | Add .gitignore (Python + Node) | Prakhar | Done |
| ✅ | React app scaffold (frontend/) — components/, pages/, services/ | Nikhil | Vite + TailwindCSS |
| ⬜ | MySQL database — create all tables with FK constraints and indexes | Prakhar | See schema above |
| ⬜ | .env setup — DB credentials, JWT secret, OpenAI key, Tavily key | Prakhar | .env.example already in repo |
| ⬜ | Invite TAs to private repo | Prakhar | Invite Devdatta1999 and Saurabh2504 |

### EPIC 2 — User Authentication

| Status | Task | Owner | Acceptance Criteria |
|---|---|---|---|
| ⬜ | POST /auth/signup — name, email, password | Prakhar | Password hashed with bcrypt. Rejects duplicate email |
| ⬜ | POST /auth/login — returns JWT token | Prakhar | Valid creds → JWT. Invalid → 401 |
| ⬜ | POST /auth/logout — invalidate token | Prakhar | Token blacklisted or session destroyed |
| ⬜ | JWT middleware for protected routes | Prakhar | Unauth requests → 401 |
| ✅ | Signup Page — form with validation | Nikhil | Validates required fields, email format, password strength. Error display. Redirects on success |
| ✅ | Login Page — form with JWT storage | Nikhil | JWT in localStorage. Redirects to dashboard. Error on failure |
| ✅ | Logout — clear token, redirect | Nikhil | Token cleared, redirects to login |

### EPIC 3 — User Profile & Preferences

| Status | Task | Owner | Acceptance Criteria |
|---|---|---|---|
| ⬜ | GET /users/me — return profile | Prakhar | Returns all profile fields |
| ⬜ | PUT /users/me — update profile | Prakhar | All fields updatable: name, email, phone, about_me, city, country, state, language, gender |
| ⬜ | POST /users/me/photo — upload profile pic | Prakhar | Accepts image, stores, returns URL |
| ⬜ | GET /users/me/preferences — get saved prefs | Prakhar | Returns cuisine, price, location, dietary, ambiance, sort |
| ⬜ | PUT /users/me/preferences — save prefs | Prakhar | Saves all preference categories |
| ✅ | Profile Page — display & edit all fields | Nikhil | Country = dropdown. State = abbreviated. Profile picture upload with preview |
| ✅ | Preferences Editor — config panel | Nikhil | Multi-select cuisines, price range, location + radius, dietary, ambiance, sort |

### EPIC 4 — Restaurant Management

| Status | Task | Owner | Acceptance Criteria |
|---|---|---|---|
| ⬜ | POST /restaurants — create listing | Prakhar | Accepts: name, cuisine, address/city, contact, description, hours, photos, price_tier, amenities |
| ⬜ | GET /restaurants — list + search | Prakhar | Search by: name, cuisine, keywords, location (city/zip). Supports pagination |
| ⬜ | GET /restaurants/{id} — single restaurant | Prakhar | Returns all details + reviews list |
| ⬜ | PUT /restaurants/{id} — update | Prakhar | All fields updatable by creator/owner |
| ⬜ | DELETE /restaurants/{id} — delete | Prakhar | Only creator/owner can delete |
| ⬜ | POST /restaurants/{id}/photos — upload photos | Prakhar | Multiple photos per restaurant |
| ⬜ | GET /restaurants/{id}/photos — get photos | Prakhar | Returns photo URL list |
| ✅ | Explore/Search Page — main landing page | Nikhil | Search bar + filters. Restaurant card grid. Cards clickable → details. Responsive |
| ✅ | Restaurant Details Page | Nikhil | All restaurant info, avg rating, all reviews. Write review link if logged in |
| ✅ | Add Restaurant Form | Nikhil | Fields: name, cuisine, address, city, contact, description, hours, photos. Validation + feedback |

### EPIC 5 — Reviews, Favorites & History

| Status | Task | Owner | Acceptance Criteria |
|---|---|---|---|
| ⬜ | POST /restaurants/{id}/reviews — create review | Prakhar | Rating (1–5), comment, server-generated date, optional photo |
| ⬜ | GET /restaurants/{id}/reviews — list all | Prakhar | Returns reviews with user info, rating, comment, date |
| ⬜ | PUT /reviews/{id} — update own review only | Prakhar | Author only → 403 for others |
| ⬜ | DELETE /reviews/{id} — delete own review only | Prakhar | Author only → 403 for others |
| ⬜ | POST /reviews/{id}/photos — attach photo to review | Prakhar | Accepts image upload, links to review via review_id in photos table |
| ⬜ | POST /favorites/{restaurant_id} — add favorite | Prakhar | Marks restaurant as favorite |
| ⬜ | DELETE /favorites/{restaurant_id} — remove | Prakhar | Removes favorite |
| ⬜ | GET /favorites — list favorites | Prakhar | Returns restaurant details for all favorites |
| ⬜ | GET /users/me/history — activity history | Prakhar | Returns past reviews + restaurants added |
| ✅ | Write Review Form | Nikhil | Interactive star rating (1–5), comment textarea, optional photo. Edit/delete on own reviews only |
| ✅ | Favorites Tab | Nikhil | Favorited restaurants as cards, unfavorite button |
| ✅ | History Tab | Nikhil | Chronological list of reviews written + restaurants added |

### EPIC 6 — AI Assistant Chatbot

| Status | Task | Owner | Acceptance Criteria |
|---|---|---|---|
| ⬜ | POST /ai-assistant/chat endpoint | Prakhar | Input: `{ "message": "...", "conversation_history": [...] }`. Output: structured JSON |
| ⬜ | Load user preferences from DB | Prakhar | Fetches cuisine, price, dietary, location, ambiance on first query |
| ⬜ | LangChain NLU integration | Prakhar | Interprets natural language → extracts: cuisine, price, dietary, occasion, ambiance |
| ⬜ | Query restaurant DB with filters | Prakhar | Filters + ranks by relevance to query + user preferences |
| ⬜ | Tavily web search integration | Prakhar | Additional context: current hours, special events, trending restaurants |
| ⬜ | Multi-turn conversation support | Prakhar | Handles follow-ups using conversation_history |
| ⬜ | Personalized recommendations with reasoning | Prakhar | Each rec explains WHY it was suggested |
| ✅ | Chat Window — conversation history | Nikhil | Scrollable chat display, prominently on home screen |
| ✅ | Chat Input + Send button | Nikhil | Text input with send, Enter key support |
| ✅ | Restaurant Recommendation Cards | Nikhil | Cards with name, rating, price, cuisine. Clickable → restaurant details |
| ✅ | Loading/Thinking indicator | Nikhil | Animated typing dots while AI processes |
| ✅ | New Conversation / Clear Chat button | Nikhil | Resets conversation history |
| ✅ | Quick action buttons | Nikhil | "Find dinner tonight", "Best rated near me", "Vegan options", etc. |

### EPIC 7 — Restaurant Owner Features

> ⚠️ The lab spec lists Restaurant Owner as a **required persona**. Core owner tasks (signup, login, profile, posting, view reviews) are must-haves. Only the Analytics Dashboard is stretch.

| Status | Task | Owner | Acceptance Criteria |
|---|---|---|---|
| ⬜ | Owner Signup — name, email, password, restaurant location | Prakhar | Separate owner role |
| ⬜ | Owner Login/Logout | Prakhar | JWT auth for owner |
| ⬜ | Owner Profile Management API | Prakhar | Update: name, cuisine, description, location, contact, photos, hours |
| ⬜ | Restaurant Posting API (full details) | Prakhar | Location, description, photos, pricing tier, amenities, cuisine, contact, hours |
| ⬜ | Claim Restaurant API | Prakhar | Owner claims existing restaurant listing |
| ⬜ | Owner View Reviews (read-only, no delete) | Prakhar | See all reviews, cannot delete |
| ⬜ | Owner Dashboard API — analytics | Prakhar | Returns: total views, rating distribution, recent reviews, sentiment |
| ⬜ | Owner Signup/Login Pages | Nikhil | Separate auth flow with validation |
| ⬜ | Restaurant Profile Management Page | Nikhil | View/edit restaurant info, photos, hours, contact |
| ⬜ | Add/Edit Restaurant Form (Owner) | Nikhil | Photos, pricing tiers, amenities |
| ⬜ | Claim Restaurant UI | Nikhil | Search + claim existing listings |
| ⬜ | Reviews Dashboard (read-only) | Nikhil | Filter + sort reviews |
| ⬜ | Analytics Dashboard *(Stretch)* | Nikhil | Views, rating chart, recent reviews, sentiment |

### EPIC 8 — Documentation & Submission

| Status | Task | Owner | Acceptance Criteria |
|---|---|---|---|
| ✅ | README.md — setup instructions | Both | Done in repo |
| ✅ | requirements.txt — Python deps | Prakhar | Done in repo |
| ⬜ | API Docs — Swagger at /docs OR Postman Collection | Prakhar | Swagger UI with testable routes, or Postman collection with descriptions, params, headers, sample responses |
| ⬜ | Detailed commit messages throughout | Both | Every commit describes what and why |
| ⬜ | Lab Report — Introduction | Both | Purpose and goals of the system |
| ⬜ | Lab Report — System Design | Both | Architecture diagram (FastAPI, MySQL, React, AI Service) |
| ⬜ | Lab Report — AI Implementation | Both | How chatbot interprets queries, uses prefs, LangChain pipeline, Tavily |
| ⬜ | Lab Report — Screenshots | Both | Home page w/ chatbot, search, details, profile/prefs, reviews, chatbot conversations, API test results |
| ⬜ | Lab Report — Upload to Canvas | Both | File: `YourName_Lab1_Report.doc` |

---

## Frontend Standards

These apply across all frontend tasks:

- Use Axios for all backend communications (see `src/services/api.js`)
- Implement proper error handling and loading states on every page
- Manage asynchronous data operations efficiently
- Reusable component design — no duplicated UI logic
- Clear separation of concerns: `components/`, `pages/`, `services/`
- Responsive on mobile, tablet, desktop (TailwindCSS)
- Semantic HTML, alt text on images, keyboard navigation support

---

## Requirement Traceability

| Lab Requirement | Covered In |
|---|---|
| User Signup (name, email, password, bcrypt) | Epic 2 |
| User Login/Logout (JWT or session) | Epic 2 |
| Profile (all fields, photo, country dropdown, state abbreviated) | Epic 3 |
| User Preferences (cuisine, price, location, dietary, ambiance, sort) | Epic 3 |
| Restaurant Search (name, cuisine, keywords, city/zip) | Epic 4 |
| Restaurant Details (all info + reviews) | Epic 4 |
| Add Restaurant Listing | Epic 4 |
| Reviews CRUD (1–5 stars, comment, server date, photos) | Epic 5 |
| Edit/Delete own reviews only | Epic 5 |
| Favorites (mark + tab) | Epic 5 |
| User History tab | Epic 5 |
| AI Chatbot — prominent on home screen | Epic 6 |
| AI: prefs, LangChain, DB query, Tavily, multi-turn, reasoning | Epic 6 |
| AI UI: chat window, input, cards, loading, clear | Epic 6 |
| Owner signup/login/profile | Epic 7 |
| Owner restaurant posting + claim | Epic 7 |
| Owner reviews dashboard + analytics | Epic 7 |
| Responsive (mobile, tablet, desktop) | All frontend tasks |
| CSS framework (TailwindCSS) | Epic 1 |
| Axios + error handling + loading states | All frontend tasks |
| Component architecture (components/pages/services) | Epic 1 |
| Swagger or Postman API docs | Epic 8 |
| Accessibility (semantic HTML, alt text, keyboard nav) | Frontend Standards |
| Scalability (optimize queries, efficient API responses) | All backend tasks |
| Commit history with detailed messages | Epic 8 |
| No venv/pycache committed | Epic 1 (.gitignore) |
| Private repo + invite TAs (Devdatta1999, Saurabh2504) | Epic 1 |
| Lab Report (intro, design, AI, screenshots) | Epic 8 |
| Upload report to Canvas as YourName_Lab1_Report.doc | Epic 8 |

---

## Additional Features

Bonus features beyond core requirements:

| Feature | Description | Epic | Owner | Complexity |
|---|---|---|---|---|
| 🗺️ Restaurant Map View | Integrate Leaflet.js on the Explore page to show restaurant locations as pins on an interactive map | Epic 4 | Nikhil | Medium |
| 🖼️ Image Optimization Pipeline | Server-side resize and compress uploaded photos with Pillow before storing — applies to profile pics, restaurant photos, and review photos | Epic 3, 4, 5 | Prakhar | Low |
| 😊 Review Sentiment Badges | Run sentiment analysis (TextBlob or LangChain) on review text and display a Positive / Mixed / Negative badge on each review card | Epic 5, 7 | Prakhar | Low |
| 🌙 Dark Mode Toggle | Implement with Tailwind dark mode classes as a toggle in the navbar — applies across all pages | Epic 1 | Nikhil | Low |
| 🔍 Elasticsearch Integration | Replace basic SQL LIKE queries with Elasticsearch for full-text search — fuzzy matching, autocomplete suggestions, weighted scoring, faceted filters | Epic 4 | Prakhar (backend), Nikhil (autocomplete UI) | High |

---

## License

Private — Academic use only.
