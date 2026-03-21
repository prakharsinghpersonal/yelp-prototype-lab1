# 🍽️ Yelp Prototype — Complete Task Plan

> **Tech Stack:** React (Frontend) · Python FastAPI + MySQL (Backend) · Langchain + Tavily (AI Chatbot)  
> **Repo:** [prakharsinghpersonal/yelp-prototype-lab1](https://github.com/prakharsinghpersonal/yelp-prototype-lab1)

---

## 👥 Team Roles

| Member | Responsibilities |
|---|---|
| **Prakhar Singh** | Backend APIs (FastAPI), Database (MySQL), AI Chatbot service (Langchain + Tavily), Swagger docs |
| **Nikhil Khaneja** | Frontend (React), all UI pages/components, Chat UI, responsive design, CSS styling |
| **Both** | Integration testing, README, Lab Report |

---

## 🏗️ Architecture

```
┌───────────────────────────────────────────────────┐
│               React Frontend (Nikhil)             │
│  Explore · Details · Auth · Profile · Chat · Owner│
│  (Axios, TailwindCSS/Bootstrap, Responsive)       │
└────────────────────┬──────────────────────────────┘
                     │  REST API (JSON)
                     ▼
┌───────────────────────────────────────────────────┐
│           FastAPI Backend (Prakhar)                │
│  /auth · /users · /restaurants · /reviews · /ai   │
│  JWT Auth · bcrypt · CORS · Validation            │
└────────┬─────────────────────┬────────────────────┘
         │                     │
         ▼                     ▼
  ┌─────────────┐    ┌──────────────────────┐
  │    MySQL     │    │  AI Chatbot Service  │
  │  (Database)  │    │  Langchain + Tavily  │
  └─────────────┘    └──────────────────────┘
```

---

## 📋 Database Schema

| Table | Key Columns |
|---|---|
| **users** | id, name, email, password_hash (bcrypt), phone, about_me, city, country, state, language, gender, profile_pic_url, role (user/owner), created_at |
| **restaurants** | id, name, cuisine_type, description, address, city, zip, phone, hours, price_tier ($–$$$$), amenities, owner_id (FK→users), avg_rating, review_count, created_at |
| **reviews** | id, user_id (FK), restaurant_id (FK), rating (1–5), comment, created_at (server-generated), updated_at |
| **photos** | id, restaurant_id (FK nullable), review_id (FK nullable), url, created_at |
| **favorites** | id, user_id (FK), restaurant_id (FK), created_at |
| **user_preferences** | id, user_id (FK), cuisines (JSON), price_range, preferred_locations (JSON), search_radius, dietary_needs (JSON), ambiance (JSON), sort_preference |

---

## ✅ Task Board

> Status key: `⬜ To Do` · `🟡 In Progress` · `✅ Done`

---

### EPIC 1: Project Setup & Infrastructure

| # | Task | Owner | Status | Acceptance Criteria |
|---|---|---|---|---|
| 1.1 | Initialize GitHub repo (private) | Prakhar | ✅ | Repo exists at github.com, is private, has `.gitignore` |
| 1.2 | Add collaborators: Nikhil, TA `Devdatta1999`, TA `Saurabh2504` | Prakhar | 🟡 | All have push access (Nikhil pending — need GitHub username) |
| 1.3 | Backend project structure — `backend/` with FastAPI scaffold, routes/, models/, services/, db/ | Prakhar | ✅ | `main.py`, `requirements.txt`, `.env.example` exist |
| 1.4 | Frontend project structure — `frontend/` with React scaffold (create-react-app or Vite) | Nikhil | ⬜ | React app runs with `npm start`, folder has components/, pages/, services/ |
| 1.5 | MySQL database setup — create schema with all tables, FK constraints, indexes | Prakhar | ⬜ | All 6 tables created, schema file in `backend/db/schema.sql` or via SQLAlchemy models |
| 1.6 | Environment configuration — `.env` for DB credentials, JWT secret, API keys | Prakhar | ⬜ | `.env.example` documents all required vars |

---

### EPIC 2: User Authentication

| # | Task | Owner | Status | Acceptance Criteria |
|---|---|---|---|---|
| 2.1 | `POST /auth/signup` — register with name, email, password | Prakhar | ⬜ | Password hashed with **bcrypt**. Returns user object. Rejects duplicate email |
| 2.2 | `POST /auth/login` — authenticate, return JWT token | Prakhar | ⬜ | Valid credentials → JWT token. Invalid → 401 with error message |
| 2.3 | `POST /auth/logout` — invalidate session/token | Prakhar | ⬜ | Token blacklisted or session destroyed |
| 2.4 | JWT middleware — protect private endpoints | Prakhar | ⬜ | Unauthenticated requests to protected routes → 401 |
| 2.5 | Signup Page (React) — form with name, email, password fields | Nikhil | ⬜ | Form validation (required fields, email format, password strength), error display, redirects to login on success |
| 2.6 | Login Page (React) — form with email, password | Nikhil | ⬜ | JWT stored in localStorage/cookie, redirects to dashboard on success, shows error on failure |
| 2.7 | Logout functionality — clear token, redirect to login | Nikhil | ⬜ | Token cleared, user redirected, protected routes inaccessible |

---

### EPIC 3: User Profile & Preferences

| # | Task | Owner | Status | Acceptance Criteria |
|---|---|---|---|---|
| 3.1 | `GET /users/me` — return current user profile | Prakhar | ⬜ | Returns: name, email, phone, about_me, city, country, state, language, gender, profile_pic_url |
| 3.2 | `PUT /users/me` — update profile fields | Prakhar | ⬜ | All fields updatable. Validates input |
| 3.3 | `POST /users/me/photo` — upload profile picture | Prakhar | ⬜ | Accepts image file, stores it, returns URL |
| 3.4 | `GET /users/me/preferences` — retrieve saved preferences | Prakhar | ⬜ | Returns cuisine preferences, price range, locations, dietary needs, ambiance, sort preference |
| 3.5 | `PUT /users/me/preferences` — save/update preferences | Prakhar | ⬜ | All preference fields saveable: cuisines (Italian, Chinese, Mexican, Indian, Japanese, American), price ($–$$$$), location/radius, dietary (vegetarian, vegan, halal, gluten-free, kosher), ambiance (casual, fine dining, family-friendly, romantic), sort (rating, distance, popularity, price) |
| 3.6 | Profile Page (React) — display & edit all user fields | Nikhil | ⬜ | Name, email, phone, about me, city editable. **Country = dropdown list**. **State = abbreviated**. Languages, gender selectable. Profile picture upload with preview |
| 3.7 | Preferences Editor (React) — configuration panel for AI assistant prefs | Nikhil | ⬜ | Multi-select for cuisines, slider/selector for price range, location input with search radius, checkboxes for dietary needs, multi-select for ambiance, dropdown for sort preference |

---

### EPIC 4: Restaurant Management

| # | Task | Owner | Status | Acceptance Criteria |
|---|---|---|---|---|
| 4.1 | `POST /restaurants` — create restaurant listing | Prakhar | ⬜ | Accepts: name, cuisine_type, address/city, contact (optional), description, hours (optional), photos (optional), price_tier, amenities |
| 4.2 | `GET /restaurants` — list/search restaurants | Prakhar | ⬜ | Search by: **restaurant name**, **cuisine type**, **keywords** (quiet, family-friendly, outdoor seating, wifi), **location** (city/zip). Pagination support |
| 4.3 | `GET /restaurants/{id}` — single restaurant details | Prakhar | ⬜ | Returns: name, cuisine, address, description, hours, contact, photos, avg_rating, review_count, list of reviews (with rating, comment, date, user info) |
| 4.4 | `PUT /restaurants/{id}` — update restaurant | Prakhar | ⬜ | All fields updatable by creator/owner |
| 4.5 | `DELETE /restaurants/{id}` — remove restaurant | Prakhar | ⬜ | Only creator/owner can delete |
| 4.6 | `POST /restaurants/{id}/photos` — upload restaurant photos | Prakhar | ⬜ | Multiple photos per restaurant, returns photo URLs |
| 4.7 | `GET /restaurants/{id}/photos` — retrieve photos | Prakhar | ⬜ | Returns list of photo URLs for a restaurant |
| 4.8 | **Explore/Search Page** (React) — main landing page | Nikhil | ⬜ | Search bar + filters (cuisine, keywords, location). Restaurant cards grid: name, rating, cuisine, price, image. Cards clickable → detail page. **Responsive** on mobile/tablet/desktop |
| 4.9 | **Restaurant Details Page** (React) | Nikhil | ⬜ | Shows: name, cuisine, address, description, hours, contact, photo gallery, avg rating, review count. Displays **all reviews** from all users with rating, comment, date. Link to write review (if logged in) |
| 4.10 | **Add Restaurant Form** (React) | Nikhil | ⬜ | Fields: name, cuisine, address, city, contact, description, hours, photos (multi-upload). Form validation, success/error feedback |

---

### EPIC 5: Reviews, Favorites & History

| # | Task | Owner | Status | Acceptance Criteria |
|---|---|---|---|---|
| 5.1 | `POST /restaurants/{id}/reviews` — create review | Prakhar | ⬜ | Rating (1–5 stars), comment text, date (server-generated), optional photo attachment. Linked to user + restaurant |
| 5.2 | `GET /restaurants/{id}/reviews` — list reviews for restaurant | Prakhar | ⬜ | Returns all reviews with user info, rating, comment, date |
| 5.3 | `PUT /reviews/{id}` — update own review | Prakhar | ⬜ | **Only the review author** can update. Returns 403 for others |
| 5.4 | `DELETE /reviews/{id}` — delete own review | Prakhar | ⬜ | **Only the review author** can delete. Returns 403 for others |
| 5.5 | `POST /favorites/{restaurant_id}` — add to favorites | Prakhar | ⬜ | Marks restaurant as favorite for current user |
| 5.6 | `DELETE /favorites/{restaurant_id}` — remove from favorites | Prakhar | ⬜ | Removes favorite entry |
| 5.7 | `GET /favorites` — list user's favorited restaurants | Prakhar | ⬜ | Returns restaurant details for all favorites |
| 5.8 | `GET /users/me/history` — user activity history | Prakhar | ⬜ | Returns past reviews written and restaurants added by user |
| 5.9 | **Write Review Form** (React) | Nikhil | ⬜ | Interactive star rating (click to set 1–5), comment textarea, optional photo upload. Edit/delete buttons visible **only on own reviews** |
| 5.10 | **Favorites Tab** (React) | Nikhil | ⬜ | Display favorited restaurants as cards with unfavorite button. Accessible from profile/dashboard |
| 5.11 | **History Tab** (React) | Nikhil | ⬜ | Chronological list of user's past reviews and restaurants they added |

---

### EPIC 6: AI Assistant Chatbot

| # | Task | Owner | Status | Acceptance Criteria |
|---|---|---|---|---|
| 6.1 | `POST /ai-assistant/chat` endpoint | Prakhar | ⬜ | Input: `{ "message": "user query", "conversation_history": [...] }`. Output: structured JSON with restaurant recommendations |
| 6.2 | Load user preferences from DB on first query | Prakhar | ⬜ | Fetches cuisine, price, dietary, location, ambiance prefs before generating recommendations |
| 6.3 | Langchain integration for natural language understanding | Prakhar | ⬜ | Interprets natural language → extracts: cuisine type, price range, dietary restrictions, occasion, ambiance |
| 6.4 | Restaurant DB query with extracted filters | Prakhar | ⬜ | Queries MySQL with interpreted filters + user preferences, ranks results by relevance |
| 6.5 | Tavily web search integration | Prakhar | ⬜ | Uses [Tavily](https://www.tavily.com/) for additional context: current hours, special events, trending restaurants |
| 6.6 | Multi-turn conversation support | Prakhar | ⬜ | Handles follow-up questions and refinements using conversation_history |
| 6.7 | Personalized recommendations with reasoning | Prakhar | ⬜ | Each recommendation includes WHY it was suggested (e.g., "Matches your Italian preference and budget") |
| 6.8 | **Chat UI — Chat Window** (React) | Nikhil | ⬜ | Conversation history displayed in scrollable chat window. **Prominently placed on home screen/dashboard** |
| 6.9 | **Chat UI — Input Field + Send** (React) | Nikhil | ⬜ | Text input for user queries with send button |
| 6.10 | **Chat UI — Restaurant Cards** (React) | Nikhil | ⬜ | Recommended restaurants displayed as cards with name, rating, price, cuisine. **Cards are clickable → link to restaurant details page** |
| 6.11 | **Chat UI — Loading/Thinking State** (React) | Nikhil | ⬜ | Clear visual indicator when AI is processing (typing dots, spinner, etc.) |
| 6.12 | **Chat UI — New Conversation** (React) | Nikhil | ⬜ | Button to clear chat and start a new conversation |
| 6.13 | *(Optional)* Quick action buttons | Nikhil | ⬜ | e.g., "Find dinner tonight", "Best rated near me", "Vegan options" |

---

### EPIC 7: Restaurant Owner Features *(Optional/Stretch)*

| # | Task | Owner | Status | Acceptance Criteria |
|---|---|---|---|---|
| 7.1 | Owner Signup API — name, email, password, restaurant location | Prakhar | ⬜ | Separate owner role, stores restaurant location on signup |
| 7.2 | Owner Login/Logout API | Prakhar | ⬜ | JWT auth for owner role |
| 7.3 | Owner Profile Management API — view/update restaurant details | Prakhar | ⬜ | Update: name, cuisine, description, location, contact, photos, hours |
| 7.4 | Restaurant Posting API — post with full details | Prakhar | ⬜ | Location, description, photos, pricing tier, amenities, cuisine, contact, hours |
| 7.5 | Claim Restaurant API — owner claims existing restaurant | Prakhar | ⬜ | Links owner account to an existing restaurant listing |
| 7.6 | Owner View Reviews API — read-only, no deletion | Prakhar | ⬜ | Owner can see all reviews for their restaurant but cannot delete them |
| 7.7 | Owner Dashboard API — analytics data | Prakhar | ⬜ | Returns: total views, ratings distribution, recent reviews, overall sentiment |
| 7.8 | Owner Signup/Login Pages (React) | Nikhil | ⬜ | Separate owner auth flow with form validation |
| 7.9 | Restaurant Profile Management Page (React) | Nikhil | ⬜ | View/edit restaurant info, photos, hours, contact |
| 7.10 | Add/Edit Restaurant Form for Owners (React) | Nikhil | ⬜ | Upload photos, set pricing tiers, manage amenities |
| 7.11 | Claim Restaurant Feature (React) | Nikhil | ⬜ | Interface to search and claim existing listings |
| 7.12 | Reviews Dashboard (React) | Nikhil | ⬜ | Read-only view of all reviews with filtering and sorting |
| 7.13 | Owner Analytics Dashboard (React) | Nikhil | ⬜ | Display: total views, ratings distribution chart, recent reviews, sentiment analysis |

---

### EPIC 8: Documentation, API Docs & Submission

| # | Task | Owner | Status | Acceptance Criteria |
|---|---|---|---|---|
| 8.1 | Swagger API Documentation — auto-generated at `/docs` | Prakhar | ⬜ | All endpoints have descriptions, request/response schemas, and examples. Swagger UI allows testing |
| 8.2 | `README.md` — project setup instructions | Both | ✅ | New developer can clone and run both backend + frontend using only the README |
| 8.3 | `requirements.txt` — Python dependencies (no venv or __pycache__) | Prakhar | ✅ | All Python deps listed, no virtual environment files committed |
| 8.4 | Detailed commit messages throughout development | Both | ⬜ | Every commit describes what changed and why |
| 8.5 | Lab Report — Introduction (purpose & goals) | Both | ⬜ | Clear system overview |
| 8.6 | Lab Report — System Design (architecture: Python, FastAPI, MySQL, React, AI) | Both | ⬜ | Architecture diagram + explanation |
| 8.7 | Lab Report — AI Implementation (how chatbot interprets queries & uses preferences) | Both | ⬜ | Explains Langchain pipeline, preference loading, Tavily usage |
| 8.8 | Lab Report — Results & Screenshots | Both | ⬜ | Screenshots of: home page with chatbot, restaurant search, restaurant details, profile/preferences, reviews, chatbot conversation examples, API test results |

---

## 🔍 Requirement Traceability Matrix

> Cross-reference of every PDF requirement → task number

| PDF Requirement | Task(s) |
|---|---|
| User Signup (name, email, password, bcrypt) | 2.1, 2.5 |
| User Login/Logout (JWT or session) | 2.2, 2.3, 2.6, 2.7 |
| Profile Page (display, update, photo upload) | 3.1, 3.2, 3.3, 3.6 |
| Profile fields: name, email, phone, about_me, city, country (dropdown), state (abbreviated), languages, gender | 3.2, 3.6 |
| User Preferences (cuisine, price, location/radius, dietary, ambiance, sort) | 3.4, 3.5, 3.7 |
| Restaurant Search (name, cuisine, keywords, location/city/zip) | 4.2, 4.8 |
| Restaurant Details (name, cuisine, address, description, hours, contact, photos, avg rating, reviews) | 4.3, 4.9 |
| Add Restaurant Listing (name, cuisine, address, contact, description, hours, photos) | 4.1, 4.10 |
| Reviews CRUD (rating 1-5, comment, server-generated date, optional photos) | 5.1–5.4, 5.9 |
| Reviews: edit/delete own only | 5.3, 5.4, 5.9 |
| Favorites (mark, display tab) | 5.5–5.7, 5.10 |
| User History (past reviews, restaurants added) | 5.8, 5.11 |
| AI Chatbot on home screen | 6.1–6.13 |
| AI: load user prefs, Langchain NLU, query DB, rank, Tavily search | 6.2–6.5 |
| AI: multi-turn conversations, personalized reasoning | 6.6, 6.7 |
| AI UI: chat window, input, restaurant cards (clickable), loading, new chat | 6.8–6.12 |
| Owner Signup/Login (stretch) | 7.1, 7.2, 7.8 |
| Owner Profile Management (stretch) | 7.3, 7.9 |
| Owner Restaurant Posting (stretch) | 7.4, 7.10 |
| Owner Claim Restaurant (stretch) | 7.5, 7.11 |
| Owner View Reviews - read only (stretch) | 7.6, 7.12 |
| Owner Analytics Dashboard (stretch) | 7.7, 7.13 |
| Responsive design (mobile, tablet, desktop) | All frontend tasks |
| CSS framework (Bootstrap/TailwindCSS) | 1.4 |
| Axios/Fetch for API calls | All frontend tasks |
| Error handling + loading states | All frontend tasks |
| Separation of concerns (components/pages/services) | 1.4 |
| Swagger or Postman API docs | 8.1 |
| Semantic HTML, alt text, keyboard nav | All frontend tasks |
| Query optimization, efficient API responses | All backend tasks |
| Commit history with detailed messages | 8.4 |
| No venv/__pycache__ committed | 1.1 (.gitignore) |
| requirements.txt | 8.3 |
| README.md with run instructions | 8.2 |
| Private repo, invite Devdatta1999 + Saurabh2504 | 1.1, 1.2 |
| Lab Report (intro, system design, AI impl, screenshots) | 8.5–8.8 |
