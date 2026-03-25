# UI Verification Checklist
**App:** YelpStar — Restaurant Discovery Platform
**Dev Server:** http://localhost:3000
**Mock Mode:** Set `VITE_USE_MOCK=true` in `frontend/.env` to test without backend

---

## Quick Setup

```bash
cd frontend
echo "VITE_USE_MOCK=true" > .env     # enable mock data
npm run dev                           # starts at http://localhost:3000
```

**Mock login credentials:**
- Email: `user@example.com`
- Password: `password123`

---

## 1. Navbar (All Pages)

| # | Check | Expected |
|---|-------|----------|
| 1.1 | Visit http://localhost:3000 | Navbar shows: logo `yelp★`, "Find Restaurants", dark mode toggle, "Owner Portal", "Log In", "Sign Up" |
| 1.2 | Click 🌙 toggle | Page switches to dark background; icon changes to ☀️; preference saved (persists on refresh) |
| 1.3 | Click ☀️ toggle | Returns to light mode |
| 1.4 | Log in → check navbar | Shows: AI Chat, Favorites, History, Add Restaurant, Owner, Profile, Log Out |
| 1.5 | Click "yelp★" logo | Navigates to home `/` |

---

## 2. Explore Page (Home) — `/`

| # | Check | Expected |
|---|-------|----------|
| 2.1 | Load http://localhost:3000 | Navy hero banner with "Discover Your Next Favorite Restaurant" |
| 2.2 | Restaurant cards visible | 8 mock restaurants shown in responsive grid |
| 2.3 | Type in search box | Cards filter by restaurant name/description in real-time |
| 2.4 | Click a cuisine chip (e.g. "Italian") | Grid filters to matching restaurants only |
| 2.5 | Click "All" cuisine chip | All restaurants shown again |
| 2.6 | Change city dropdown | Filters by city |
| 2.7 | Not logged in — AI banner | Shows "Sign in to use AI Chat" prompt |
| 2.8 | Logged in — AI banner | Shows "Ask our AI for recommendations" with link to /chat |
| 2.9 | Dark mode on | Cards have dark gray background, light text |
| 2.10 | Click any restaurant card | Navigates to `/restaurants/:id` |

---

## 3. Restaurant Details Page — `/restaurants/:id`

| # | Check | Expected |
|---|-------|----------|
| 3.1 | Open any restaurant | Restaurant name, star rating, review count, price tier, cuisine type all visible |
| 3.2 | Photo gallery | If photos exist: grid of images. If none: 🍽️ placeholder |
| 3.3 | Info card | Shows Address, City, Phone, Hours, Amenities, About |
| 3.4 | Map section | Leaflet map loads with pin at restaurant location (or "Location unavailable") |
| 3.5 | "Open in Google Maps ↗" link | Visible below map, opens correct Google Maps URL |
| 3.6 | Not logged in | No review form shown; reviews list still visible |
| 3.7 | Log in → revisit | Review form appears: star rating buttons (1–5) + comment textarea |
| 3.8 | Submit a review | Review appears at top of list with your name, date, star rating |
| 3.9 | Attach photo to review | File picker shows; after submit, photo renders in review card |
| 3.10 | Edit own review | Edit/Delete buttons visible on your review; click Edit → form pre-fills |
| 3.11 | Cancel edit | Form clears and returns to "Write a Review" |
| 3.12 | Delete a review | Confirm dialog → review removed from list |
| 3.13 | ♡ Save button | Click → changes to ♥ Saved (adds to favorites) |
| 3.14 | Dark mode | All cards, text, map container render correctly in dark |

---

## 4. Login Page — `/login`

| # | Check | Expected |
|---|-------|----------|
| 4.1 | Visit http://localhost:3000/login | Email + password fields, "Log In" button, link to Sign Up |
| 4.2 | Submit with mock credentials | Redirects to `/` (home); navbar updates to logged-in state |
| 4.3 | Submit wrong credentials | Error message shown inline |
| 4.4 | Already logged in → visit /login | Still shows login page (no auto-redirect by design) |

---

## 5. Signup Page — `/signup`

| # | Check | Expected |
|---|-------|----------|
| 5.1 | Visit http://localhost:3000/signup | Name, email, password fields |
| 5.2 | Submit valid form | Logs in + redirects to home |
| 5.3 | Submit empty | Validation error shown |

---

## 6. Profile Page — `/profile` *(requires login)*

| # | Check | Expected |
|---|-------|----------|
| 6.1 | Visit /profile without login | Redirected to `/login` |
| 6.2 | Log in → visit /profile | Two tabs: "Profile" and "Preferences" |
| 6.3 | Profile tab | Name, email, phone, bio, country dropdown, state (2-char), photo upload button |
| 6.4 | Upload profile photo | File picker works; filename shown |
| 6.5 | Save Profile | Success message shown |
| 6.6 | Preferences tab | Cuisine multi-select chips, price range chips, dietary restrictions, ambiance chips, sort preference |
| 6.7 | Select cuisine chips | Selected chips highlighted in orange |
| 6.8 | Save Preferences | Success message shown |

---

## 7. AI Chat Page — `/chat` *(requires login)*

| # | Check | Expected |
|---|-------|----------|
| 7.1 | Visit /chat | Empty chat with quick action buttons (e.g. "Best Italian restaurants") |
| 7.2 | Click a quick action | Message sent; typing animation (three dots) for ~600ms; AI response appears |
| 7.3 | Type custom message | Send button or Enter key submits |
| 7.4 | AI response with restaurants | Restaurant recommendation cards appear with name, rating, link |
| 7.5 | Click restaurant card in chat | Navigates to restaurant details page |
| 7.6 | New Chat button | Clears conversation; quick actions reappear |
| 7.7 | Dark mode | Chat bubbles render in correct dark colors |

---

## 8. Favorites Page — `/favorites` *(requires login)*

| # | Check | Expected |
|---|-------|----------|
| 8.1 | Visit /favorites | Shows restaurants saved as favorites |
| 8.2 | No favorites | Empty state message shown |
| 8.3 | Click a favorite card | Navigates to restaurant details |

---

## 9. History Page — `/history` *(requires login)*

| # | Check | Expected |
|---|-------|----------|
| 9.1 | Visit /history | List of recently viewed restaurants |
| 9.2 | No history | Empty state message |

---

## 10. Add Restaurant Page — `/add-restaurant` *(requires login)*

| # | Check | Expected |
|---|-------|----------|
| 10.1 | Visit /add-restaurant | Form with name, cuisine, price tier, description, address, city, zip, phone, hours, amenities, photos |
| 10.2 | Submit without name/city | Inline error: "Name and city are required" |
| 10.3 | Select price tier | Active tier button turns red (#d62828) |
| 10.4 | Toggle amenity chips | Selected chips turn orange (#f77f00) |
| 10.5 | Add photos | File picker, filenames listed below |
| 10.6 | Submit valid form | Navigates to new restaurant's detail page |

---

## 11. Owner Portal — Login/Signup

| # | Check | Expected |
|---|-------|----------|
| 11.1 | Visit /owner/login | Separate owner login form; link to owner signup |
| 11.2 | Visit /owner/signup | Owner registration form |
| 11.3 | Log in as owner | Redirects to /owner/dashboard |

---

## 12. Owner Dashboard — `/owner/dashboard` *(requires login)*

| # | Check | Expected |
|---|-------|----------|
| 12.1 | Visit /owner/dashboard | 4 stat cards: Total Views, Avg Rating, Total Reviews, Favorites |
| 12.2 | Rating distribution | Bar chart showing 1–5 star breakdown |
| 12.3 | Recent reviews feed | Latest reviews with stars, username, comment |
| 12.4 | Dark mode | Cards and chart render correctly |

---

## 13. Owner Restaurant Editor — `/owner/restaurant`

| # | Check | Expected |
|---|-------|----------|
| 13.1 | Visit /owner/restaurant | Full edit form for restaurant profile |
| 13.2 | Fields pre-filled | Name, cuisine, price tier, description, address, hours, amenities loaded from API |
| 13.3 | Price tier buttons | Active tier highlighted red |
| 13.4 | Amenity chips toggle | Orange when selected |
| 13.5 | Photo upload | File picker works; existing photos shown |
| 13.6 | Save Changes | Success message; data persisted |

---

## 14. Owner Add Restaurant — `/owner/add-restaurant`

| # | Check | Expected |
|---|-------|----------|
| 14.1 | Visit /owner/add-restaurant | Same form as user add-restaurant but under owner flow |
| 14.2 | Submit | Creates restaurant + uploads photos → navigates to detail page |

---

## 15. Owner Reviews — `/owner/reviews`

| # | Check | Expected |
|---|-------|----------|
| 15.1 | Visit /owner/reviews | Read-only notice banner at top |
| 15.2 | Sort options | Newest / Oldest / Highest Rated / Lowest Rated all work |
| 15.3 | Star filter | Click a star (1–5) → shows only matching reviews |
| 15.4 | Sentiment badge | Each review shows Positive / Mixed / Negative badge |
| 15.5 | Dark mode | Badges and cards render correctly |

---

## 16. Claim Restaurant — `/owner/claim`

| # | Check | Expected |
|---|-------|----------|
| 16.1 | Visit /owner/claim | Search box to find existing restaurants |
| 16.2 | Search a restaurant | Matching results appear |
| 16.3 | Claim unclaimed restaurant | "Claim" button available; success message on click |
| 16.4 | Already claimed restaurant | "Claimed" or disabled state shown |

---

## 17. Dark Mode — Global

| # | Check | Expected |
|---|-------|----------|
| 17.1 | Toggle dark mode on home | Background #1f2937 (gray-800), cards dark, white text |
| 17.2 | Navigate to other pages in dark | Dark mode persists across all pages |
| 17.3 | Refresh page | Dark mode preference preserved (localStorage) |
| 17.4 | Navbar in dark | Navy bar stays; icons/links visible |

---

## 18. Map — Restaurant Details

| # | Check | Expected |
|---|-------|----------|
| 18.1 | Open restaurant with address | Leaflet map renders with blue pin |
| 18.2 | Click pin | Popup shows restaurant name + address |
| 18.3 | Restaurant with no address | Map shows "📍 Location unavailable" placeholder |
| 18.4 | Map attribution | OpenStreetMap attribution visible |
| 18.5 | Scroll wheel zoom disabled | Page scrolls normally over map; no zoom hijack |

---

## 19. Protected Routes

| # | Check | Expected |
|---|-------|----------|
| 19.1 | Visit /profile while logged out | Redirected to /login |
| 19.2 | Visit /chat while logged out | Redirected to /login |
| 19.3 | Visit /favorites while logged out | Redirected to /login |
| 19.4 | Visit /history while logged out | Redirected to /login |
| 19.5 | Visit /owner/dashboard while logged out | Redirected to /login |
| 19.6 | Unknown URL (e.g. /xyz) | Redirected to `/` (home) |

---

## 20. Responsive Layout

| # | Check | Expected |
|---|-------|----------|
| 20.1 | Resize to mobile (~375px) | Cards stack to 1 column; navbar links condense |
| 20.2 | Tablet (~768px) | 2-column grid on explore page |
| 20.3 | Desktop (1280px+) | 3–4 column grid; map + info side by side on details page |

---

## Summary Counts

| Section | Items |
|---------|-------|
| Navbar | 5 |
| Explore / Home | 10 |
| Restaurant Details | 14 |
| Auth (Login/Signup) | 8 |
| Profile | 8 |
| AI Chat | 7 |
| Favorites + History | 5 |
| Add Restaurant | 6 |
| Owner Portal | 3 |
| Owner Dashboard | 4 |
| Owner Restaurant Editor | 6 |
| Owner Add Restaurant | 2 |
| Owner Reviews | 5 |
| Claim Restaurant | 4 |
| Dark Mode | 4 |
| Map | 5 |
| Protected Routes | 6 |
| Responsive | 3 |
| **Total** | **105** |

---

*All items marked ✓ = ready for demo and lab report screenshots.*
