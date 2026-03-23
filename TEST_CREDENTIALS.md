# 🧪 Test Credentials Sheet

Database has been successfully populated with comprehensive test data!

## 📋 Test Users

All passwords are: `password123`

| # | Email | Name | City | Role | Testing Purpose |
|---|-------|------|------|------|-----------------|
| 1 | prakhar@demo.com | Prakhar Singh | San Jose | user | Test explore, favorites, reviews |
| 2 | nikhil@demo.com | Nikhil Khaneja | San Francisco | user | Test pagination (different city) |
| 3 | sarah@demo.com | Sarah Johnson | Palo Alto | user | Test reviews and favorites |
| 4 | mike@demo.com | Mike Chen | San Jose | user | Test restaurant add/edit |
| 5 | priya@demo.com | Priya Patel | Mountain View | user | Test chat feature |
| 6 | john@demo.com | John Smith | San Francisco | user | Test multiple reviews |
| 7 | emma@demo.com | Emma Wilson | Cupertino | user | Test history/profile |
| 8 | raj@demo.com | Raj Kumar | San Jose | user | Test search/filter |
| 9 | lisa@demo.com | Lisa Anderson | Palo Alto | user | Test recommendations |
| 10 | owner@demo.com | Restaurant Owner | San Jose | owner | Test restaurant owner features |

---

## 🏪 Test Data Summary

### Restaurants Created: 22
- **Chinese Cuisine**: 3 restaurants
- **Italian Cuisine**: 3 restaurants
- **Indian Cuisine**: 3 restaurants
- **Japanese Cuisine**: 3 restaurants
- **Mexican Cuisine**: 3 restaurants
- **American Cuisine**: 3 restaurants
- **Mediterranean Cuisine**: 1 restaurant

Spread across: San Jose, San Francisco, Palo Alto, Mountain View, Cupertino

### Test Interactions Created:
- **Reviews**: 12 (with ratings 4-5 stars)
- **Favorites**: 12 (user-restaurant relationships)
- **Restaurant Variations**: Multiple price tiers ($, $$, $$$, $$$$)

---

## 🚀 Quick Test Scenarios

### 1. **Login & Browse Test**
```
Email: prakhar@demo.com
Password: password123
→ Login, explore restaurants, test pagination with "Load More" button
```

### 2. **Favorites Test**
```
Email: sarah@demo.com
Password: password123
→ Login, go to Favorites, verify 12 favorite restaurants with pagination
```

### 3. **Reviews Test**
```
Email: john@demo.com
Password: password123
→ Login, click on a restaurant, view reviews, verify ratings display
```

### 4. **Multi-City Search**
```
Email: nikhil@demo.com (San Francisco)
Password: password123
→ Login, explore restaurants, verify city-based filtering works
```

### 5. **AI Chat Test**
```
Email: priya@demo.com
Password: password123
→ Login, go to Chat page, test AI recommendations
```

### 6. **Add Restaurant Test**
```
Email: mike@demo.com
Password: password123
→ Login, click "Add Restaurant", create new listing
```

### 7. **Pagination Test**
```
Email: prakhar@demo.com or any user
Password: password123
→ Login → Explore page → Scroll to bottom → Click "Load More" 
→ Verify 10 restaurants load, then next batch loads
```

### 8. **History Test**
```
Email: emma@demo.com
Password: password123
→ Login, go to History page to view browsing history
```

---

## 🔗 Features by User

| Feature | Recommended Test Users |
|---------|------------------------|
| **Login & Authentication** | Any user |
| **Browse Restaurants** | prakhar@demo.com |
| **View Favorites** | sarah@demo.com |
| **Write Reviews** | john@demo.com |
| **Add Restaurant** | mike@demo.com |
| **AI Chat** | priya@demo.com |
| **User Profile** | emma@demo.com |
| **Search/Filter** | nikhil@demo.com |
| **Restaurant Details** | lisa@demo.com |
| **Owner Dashboard** | owner@demo.com |

---

## ✅ Verification Checklist

- [ ] Can login with any test user
- [ ] Restaurants display (22 total across all cities)
- [ ] Pagination works - shows 10 restaurants, "Load More" button works
- [ ] Favorites page shows personalized favorites
- [ ] Reviews display with star ratings (4-5 stars)
- [ ] Can add a new restaurant
- [ ] Can write a review
- [ ] AI chat returns restaurant recommendations
- [ ] Can mark/unmark favorites
- [ ] Profile page displays user info
- [ ] History page shows browsing history

---

## 🗄️ Backend API Endpoints

### Authentication
- `POST /auth/login` - Login with email & password
- `POST /auth/signup` - Create new account

### Restaurants (with pagination)
- `GET /restaurants?skip=0&limit=10` - Get restaurants with pagination
- `POST /restaurants` - Add new restaurant
- `GET /restaurants/{id}` - Get restaurant details

### Reviews
- `POST /restaurants/{id}/reviews` - Add review
- `GET /restaurants/{id}/reviews` - Get reviews

### Favorites (with pagination)
- `GET /favorites?skip=0&limit=10` - Get user's favorites with pagination
- `POST /favorites/{restaurant_id}` - Add favorite
- `DELETE /favorites/{restaurant_id}` - Remove favorite

### AI Chat
- `POST /ai/chat` - Get AI recommendations

---

## 📊 Database Stats

**Total Records:**
- Users: 10
- Restaurants: 22
- Reviews: 12
- Favorites: 12
- Cities: 5 (San Jose, San Francisco, Palo Alto, Mountain View, Cupertino)

**Price Distribution:**
- $: 5 restaurants
- $$: 8 restaurants
- $$$: 6 restaurants
- $$$$: 3 restaurants

---

## 🎯 Common Testing Flows

### Test Flow 1: Complete User Journey
1. Signup → Get email verification
2. Login with prakhar@demo.com / password123
3. Browse restaurants (test pagination)
4. Click on a restaurant
5. Add to favorites
6. Write a review
7. Check favorites page
8. Try AI chat for recommendations

### Test Flow 2: Multi-User Scenario
1. Login as User A (prakhar@demo.com)
2. Add restaurant to favorites
3. Logout
4. Login as User B (sarah@demo.com)
5. Verify User B sees different favorites
6. Both can review same restaurant independently

### Test Flow 3: Pagination Performance
1. Login any user
2. Explore page loads first 10 restaurants
3. Scroll to bottom
4. Click "Load More"
5. Verify next 10 restaurants load
6. Click again, verify pagination works smoothly

---

**Happy Testing! 🎉**
