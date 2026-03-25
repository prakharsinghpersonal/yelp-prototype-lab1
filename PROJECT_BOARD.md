# Lab 1 — Yelp Prototype: Implementation Plan & Team Task Board

> **Due Date:** March 24, 2026 — 11:59 PM · **Points:** 40  
> **Tech Stack:** React (Frontend) · Python FastAPI + MySQL (Backend) · Langchain + Tavily (AI Chatbot)  
> **Team:** Prakhar Singh (`prakharsinghpersonal`) · Nikhil Khaneja (`nikhilkhaneja002@gmail.com`)

---

## Team Role Assignments

| Area | Owner | Rationale |
|---|---|---|
| **Backend (FastAPI + MySQL)** | **Prakhar** | All API endpoints, DB schema, auth, security |
| **Frontend (React)** | **Nikhil** | All UI pages, components, routing, styling |
| **AI Chatbot Service** | **Prakhar** | Langchain + Tavily integration, `/ai-assistant/chat` endpoint |
| **AI Chatbot UI** | **Nikhil** | Chat interface component, quick actions, loading states |
| **Integration & Testing** | **Both** | End-to-end wiring, API docs (Swagger), final QA |
| **Report & Submission** | **Both** | Screenshots, documentation, Canvas upload |

---

## Architecture Overview

```
┌──────────────────────────────────────────────────┐
│                  React Frontend                  │
│  (Explore, Details, Auth, Profile, Chat, Owner)  │
└──────────────────┬───────────────────────────────┘
                   │  Axios / Fetch
                   ▼
┌──────────────────────────────────────────────────┐
│             FastAPI Backend (Python)             │
│   /auth  /users  /restaurants  /reviews  /ai     │
│           JWT Auth · bcrypt · CORS               │
└──────────┬──────────────────┬────────────────────┘
           │                  │
           ▼                  ▼
    ┌────────────┐   ┌─────────────────────┐
    │   MySQL    │   │  AI Chatbot Service  │
    │   (DB)     │   │  Langchain + Tavily  │
    └────────────┘   └─────────────────────┘
```

---

## Sprint Plan — Task Board

> Each task has a **Status**, **Owner**, **Description**, **Acceptance Criteria**, and **Expected Output**.  
> Status key: `⬜ To Do` · `🟡 In Progress` · `✅ Done`

---

### 🏗️ EPIC 1: Project Setup & Infrastructure

#### Task 1.1 — Initialize GitHub Repository
| Field | Detail |
|---|---|
| **Status** | ⬜ To Do |
| **Owner** | Prakhar |
| **Description** | Create a private GitHub repo `yelp-prototype-lab1`, add `.gitignore`, initialize with README |
| **Acceptance Criteria** | Repo exists, is private, has `.gitignore` for Python + Node |
| **Expected Output** | GitHub repo URL |

#### Task 1.2 — Add Collaborators
| Field | Detail |
|---|---|
| **Status** | ⬜ To Do |
| **Owner** | Prakhar |
| **Description** | Add Nikhil (`nikhilkhaneja002@gmail.com`), TA `Devdatta1999`, TA `Saurabh2504` as collaborators |
| **Acceptance Criteria** | All three have push access to the repo |
| **Expected Output** | Invitation sent confirmations |

#### Task 1.3 — Project Folder Structure
| Field | Detail |
|---|---|
| **Status** | ⬜ To Do |
| **Owner** | Both |
| **Description** | Set up `/backend` (FastAPI) and `/frontend` (React) folder structures with boilerplate |
| **Acceptance Criteria** | `backend/` has `main.py`, `requirements.txt`; `frontend/` has React app scaffold |
| **Expected Output** | Clean project skeleton pushed to `main` branch |

#### Task 1.4 — Database Setup (MySQL Schema)
| Field | Detail |
|---|---|
| **Status** | ⬜ To Do |
| **Owner** | Prakhar |
| **Description** | Design and create MySQL schema with tables: `users`, `owners`, `restaurants`, `reviews`, `favorites`, `user_preferences`, `photos` |
| **Acceptance Criteria** | SQL migration file exists; all tables created with proper FK constraints and indexes |
| **Expected Output** | `backend/db/schema.sql` or SQLAlchemy models |

**Database Schema (draft):**

| Table | Key Columns |
|---|---|
| `users` | id, name, email, password_hash, phone, about_me, city, country, state, language, gender, profile_pic_url, role (user/owner), created_at |
| `restaurants` | id, name, cuisine_type, description, address, city, zip, phone, hours, price_tier, owner_id (FK), avg_rating, review_count, created_at |
| `reviews` | id, user_id (FK), restaurant_id (FK), rating (1–5), comment, created_at, updated_at |
| `photos` | id, restaurant_id (FK), review_id (FK nullable), url, created_at |
| `favorites` | id, user_id (FK), restaurant_id (FK), created_at |
| `user_preferences` | id, user_id (FK), cuisines (JSON), price_range, location, dietary_needs (JSON), ambiance (JSON), sort_preference |

---

### 🔐 EPIC 2: Authentication (Backend + Frontend)

#### Task 2.1 — Auth API Endpoints (Backend)
| Field | Detail |
|---|---|
| **Status** | ⬜ To Do |
| **Owner** | Prakhar |
| **Description** | Implement `POST /auth/signup`, `POST /auth/login`, `POST /auth/logout` with JWT tokens and bcrypt password hashing |
| **Acceptance Criteria** | Users can register, login (get JWT), logout (invalidate/blacklist token). Passwords are hashed. Input validation returns proper error messages |
| **Expected Output** | Working auth endpoints tested via Swagger UI |

#### Task 2.2 — Signup & Login Pages (Frontend)
| Field | Detail |
|---|---|
| **Status** | ⬜ To Do |
| **Owner** | Nikhil |
| **Description** | Build Signup and Login pages with form validation, error handling, JWT storage, and redirect logic |
| **Acceptance Criteria** | User can sign up, log in, see errors for invalid input. JWT stored in localStorage/cookie. Redirects to dashboard on success |
| **Expected Output** | `/signup` and `/login` routes working end-to-end |

---

### 👤 EPIC 3: User Profile & Preferences

#### Task 3.1 — User Profile API (Backend)
| Field | Detail |
|---|---|
| **Status** | ⬜ To Do |
| **Owner** | Prakhar |
| **Description** | `GET /users/me`, `PUT /users/me`, `POST /users/me/photo` — profile CRUD with image upload |
| **Acceptance Criteria** | Authenticated user can view/update profile fields (name, email, phone, about_me, city, country, state, languages, gender). Profile picture upload works |
| **Expected Output** | Profile endpoints functional with file upload support |

#### Task 3.2 — User Preferences API (Backend)
| Field | Detail |
|---|---|
| **Status** | ⬜ To Do |
| **Owner** | Prakhar |
| **Description** | `GET /users/me/preferences`, `PUT /users/me/preferences` — save/retrieve cuisine, price range, dietary, ambiance, sort preferences |
| **Acceptance Criteria** | Preferences saved per user and retrievable for AI assistant usage |
| **Expected Output** | Preferences endpoints with proper JSON storage |

#### Task 3.3 — Profile & Preferences Editor Page (Frontend)
| Field | Detail |
|---|---|
| **Status** | ⬜ To Do |
| **Owner** | Nikhil |
| **Description** | Build profile page with editable fields, image upload, dropdown for country, and a preferences tab with multi-select for cuisines, dietary needs, ambiance, price range slider |
| **Acceptance Criteria** | All profile fields editable and saveable. Country as dropdown, state as abbreviation. Preferences section with proper UI controls |
| **Expected Output** | `/profile` route with both profile and preferences editing |

---

### 🍽️ EPIC 4: Restaurant Management

#### Task 4.1 — Restaurant CRUD API (Backend)
| Field | Detail |
|---|---|
| **Status** | ⬜ To Do |
| **Owner** | Prakhar |
| **Description** | `POST /restaurants`, `GET /restaurants/{id}`, `PUT /restaurants/{id}`, `DELETE /restaurants/{id}`, `GET /restaurants` (list with search/filter) |
| **Acceptance Criteria** | Create restaurant with all fields (name, cuisine, address, city, zip, phone, hours, price_tier, description). Search by name, cuisine, keywords, location. Filter and pagination work |
| **Expected Output** | Full restaurant CRUD + search endpoints |

#### Task 4.2 — Restaurant Photo Upload API (Backend)
| Field | Detail |
|---|---|
| **Status** | ⬜ To Do |
| **Owner** | Prakhar |
| **Description** | `POST /restaurants/{id}/photos`, `GET /restaurants/{id}/photos` — upload and retrieve photos |
| **Acceptance Criteria** | Multiple photos uploadable per restaurant. Photos served via static file endpoint or cloud URL |
| **Expected Output** | Photo upload/retrieval working |

#### Task 4.3 — Explore/Search Page (Frontend)
| Field | Detail |
|---|---|
| **Status** | ⬜ To Do |
| **Owner** | Nikhil |
| **Description** | Main landing page with search bar, cuisine/keyword/location filters, restaurant cards grid with name, rating, cuisine, price, image |
| **Acceptance Criteria** | Search updates results in real-time or on submit. Cards are clickable and link to detail page. Responsive on mobile/tablet/desktop |
| **Expected Output** | `/explore` or `/` landing page with full search functionality |

#### Task 4.4 — Restaurant Details Page (Frontend)
| Field | Detail |
|---|---|
| **Status** | ⬜ To Do |
| **Owner** | Nikhil |
| **Description** | Full restaurant detail view: name, cuisine, description, hours, contact, photo gallery, avg rating, review count, review list |
| **Acceptance Criteria** | All restaurant info displayed. Reviews shown with user name, rating, comment, date. Links to write review if logged in |
| **Expected Output** | `/restaurant/:id` route with all details |

#### Task 4.5 — Add Restaurant Form (Frontend)
| Field | Detail |
|---|---|
| **Status** | ⬜ To Do |
| **Owner** | Nikhil |
| **Description** | Form for creating a new restaurant with all required fields, photo upload, form validation |
| **Acceptance Criteria** | Form submits to API, shows success/error feedback, validates required fields |
| **Expected Output** | `/add-restaurant` route with working form |

---

### ⭐ EPIC 5: Reviews & Favorites

#### Task 5.1 — Reviews API (Backend)
| Field | Detail |
|---|---|
| **Status** | ⬜ To Do |
| **Owner** | Prakhar |
| **Description** | `POST /restaurants/{id}/reviews`, `GET /restaurants/{id}/reviews`, `PUT /reviews/{id}`, `DELETE /reviews/{id}` — users can only edit/delete own reviews |
| **Acceptance Criteria** | Create review with rating (1–5) and comment. List all reviews for a restaurant. Update/delete restricted to review author. Server-generated timestamps |
| **Expected Output** | Fully functional reviews API with authorization checks |

#### Task 5.2 — Favorites API (Backend)
| Field | Detail |
|---|---|
| **Status** | ⬜ To Do |
| **Owner** | Prakhar |
| **Description** | `POST /favorites/{restaurant_id}`, `DELETE /favorites/{restaurant_id}`, `GET /favorites` — toggle and list favorites |
| **Acceptance Criteria** | User can favorite/unfavorite restaurants. Favorites list returns restaurant details |
| **Expected Output** | Favorites toggle and list endpoints |

#### Task 5.3 — Write Review Form (Frontend)
| Field | Detail |
|---|---|
| **Status** | ⬜ To Do |
| **Owner** | Nikhil |
| **Description** | Review form with star rating selector, comment text area, optional photo upload. Edit/delete existing reviews |
| **Acceptance Criteria** | Star rating is interactive (click to set). Form validates required fields. Edit/delete available for own reviews only |
| **Expected Output** | Review form accessible from restaurant details page |

#### Task 5.4 — Favorites & History Tabs (Frontend)
| Field | Detail |
|---|---|
| **Status** | ⬜ To Do |
| **Owner** | Nikhil |
| **Description** | Favorites tab showing saved restaurants. History tab showing past reviews and added restaurants |
| **Acceptance Criteria** | Favorites show restaurant cards with remove option. History shows chronological activity |
| **Expected Output** | `/favorites` and `/history` routes or tabs in profile |

---

### 🤖 EPIC 6: AI Assistant Chatbot

#### Task 6.1 — AI Chatbot Backend Service (Backend)
| Field | Detail |
|---|---|
| **Status** | ⬜ To Do |
| **Owner** | Prakhar |
| **Description** | `POST /ai-assistant/chat` endpoint. Uses Langchain to interpret user queries, loads user preferences, queries restaurant DB, ranks results, uses Tavily for web search context |
| **Acceptance Criteria** | Input: `{ "message": "...", "conversation_history": [...] }`. Output: structured JSON with recommendations. Supports multi-turn conversations. Personalizes based on user preferences. Tavily integration for external context |
| **Expected Output** | Working chatbot endpoint that returns relevant restaurant recommendations |

#### Task 6.2 — AI Chatbot UI (Frontend)
| Field | Detail |
|---|---|
| **Status** | ⬜ To Do |
| **Owner** | Nikhil |
| **Description** | Chat interface on home screen: conversation history window, input field, recommended restaurant cards (clickable), loading/thinking indicator, new conversation button |
| **Acceptance Criteria** | Chat feels conversational. Restaurant cards link to detail page. Loading state shown while AI processes. Chat history maintained within session. Quick action buttons (optional) |
| **Expected Output** | Prominent chatbot component on the home/explore page |

---

### 🏢 EPIC 7: Restaurant Owner Features (Optional/Stretch)

#### Task 7.1 — Owner Auth & Profile API (Backend)
| Field | Detail |
|---|---|
| **Status** | ⬜ To Do |
| **Owner** | Prakhar |
| **Description** | Owner signup/login with restaurant location. Owner profile CRUD. Claim restaurant feature |
| **Acceptance Criteria** | Separate owner role in auth. Owner can manage their restaurant profile |
| **Expected Output** | Owner auth + profile endpoints |

#### Task 7.2 — Owner Dashboard & Pages (Frontend)
| Field | Detail |
|---|---|
| **Status** | ⬜ To Do |
| **Owner** | Nikhil |
| **Description** | Owner signup/login, restaurant profile management, reviews dashboard (read-only), analytics dashboard with metrics |
| **Acceptance Criteria** | Owner can view their restaurant's reviews, see analytics (view count, rating distribution, sentiment) |
| **Expected Output** | Owner dashboard pages suite |

---

### 📄 EPIC 8: Documentation, API Docs & Submission

#### Task 8.1 — Swagger/API Documentation
| Field | Detail |
|---|---|
| **Status** | ⬜ To Do |
| **Owner** | Prakhar |
| **Description** | FastAPI auto-generates Swagger UI at `/docs`. Ensure all endpoints have descriptions, request/response schemas, and examples |
| **Acceptance Criteria** | `/docs` shows all endpoints with testable interface |
| **Expected Output** | Complete Swagger documentation |

#### Task 8.2 — README.md
| Field | Detail |
|---|---|
| **Status** | ⬜ To Do |
| **Owner** | Both |
| **Description** | Setup instructions, environment variables, how to run backend/frontend, tech stack description |
| **Acceptance Criteria** | New developer can set up and run the project following only the README |
| **Expected Output** | Comprehensive `README.md` in repo root |

#### Task 8.3 — Lab Report
| Field | Detail |
|---|---|
| **Status** | ⬜ To Do |
| **Owner** | Both |
| **Description** | Write report with: Introduction, System Design diagram, AI Implementation explanation, Screenshots of all key screens, API test results |
| **Acceptance Criteria** | Covers all sections in report guidelines. Includes screenshots of: home page with chatbot, search, restaurant details, profile/preferences, reviews, chatbot conversations |
| **Expected Output** | `PrakharSingh_Lab1_Report.doc` uploaded to Canvas |

---

## Timeline (3-Day Sprint)

| Day | Prakhar (Backend) | Nikhil (Frontend) |
|---|---|---|
| **Day 1** (Mar 21) | ✅ Repo setup + collabs · DB Schema · Auth API · User Profile/Prefs API | React scaffold · Auth pages (Signup/Login) · Profile/Preferences page |
| **Day 2** (Mar 22) | Restaurant CRUD + Search API · Reviews API · Favorites API · Photo upload | Explore/Search page · Restaurant Details page · Add Restaurant form · Review form · Favorites/History |
| **Day 3** (Mar 23) | AI Chatbot service (Langchain + Tavily) · Owner APIs (stretch) · Swagger docs | AI Chat UI · Owner pages (stretch) · Responsive polish · Integration testing |
| **Day 4** (Mar 24 — due) | Final testing · Bug fixes · Report (both) | Final testing · Bug fixes · Report (both) |

---

## Proposed Changes

### GitHub Repository Setup

#### [NEW] `.gitignore`
- Python ignores: `__pycache__/`, `venv/`, `.env`, `*.pyc`
- Node ignores: `node_modules/`, `build/`, `.env.local`

#### [NEW] `README.md`
- Project overview, setup instructions, tech stack

#### [NEW] `backend/` directory
- FastAPI project structure with `main.py`, `requirements.txt`, routes, models, services

#### [NEW] `frontend/` directory
- React app with component-based architecture

---

## Verification Plan

### Automated Tests
1. **Backend API smoke test**: After Prakhar sets up endpoints, run `curl` or use Swagger UI at `http://localhost:8000/docs` to test each endpoint
2. **Frontend build check**: `cd frontend && npm run build` to verify no build errors

### Manual Verification
1. **GitHub repo**: Visit the repo URL, confirm it's private, confirm all collaborators are added
2. **Full flow test**: Sign up → Login → Set preferences → Search restaurants → View details → Write review → Use AI chatbot → Favorite a restaurant
3. **Responsive check**: Test on mobile viewport (Chrome DevTools) for all pages
