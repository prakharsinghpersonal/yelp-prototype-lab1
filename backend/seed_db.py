from db.database import ensure_indexes, get_database, next_sequence, utcnow
from services.auth import hash_password


def seed() -> None:
    db = get_database()
    ensure_indexes(db)

    db.users.delete_many({})
    db.restaurants.delete_many({})
    db.reviews.delete_many({})
    db.favorites.delete_many({})
    db.user_preferences.delete_many({})
    db.sessions.delete_many({})
    db.events.delete_many({})
    db.counters.delete_many({})

    now = utcnow()
    users = []
    user_specs = [
        ("Demo User", "user@example.com", "user", "+1 5551112222", "San Jose", "CA", "United States"),
        ("Ava Customer", "ava@example.com", "user", "+1 5551113333", "Santa Clara", "CA", "United States"),
        ("Noah Customer", "noah@example.com", "user", "+1 5551114444", "Sunnyvale", "CA", "United States"),
        ("Demo Owner", "owner@example.com", "owner", "+1 5553334444", "San Jose", "CA", "United States"),
        ("Nina Owner", "nina.owner@example.com", "owner", "+1 5553335555", "Palo Alto", "CA", "United States"),
        ("Carlos Owner", "carlos.owner@example.com", "owner", "+1 5553336666", "Mountain View", "CA", "United States"),
    ]
    user_ids = {}
    for name, email, role, phone, city, state, country in user_specs:
        user_id = next_sequence(db, "users")
        user_ids[email] = user_id
        users.append(
            {
                "id": user_id,
                "name": name,
                "email": email,
                "password_hash": hash_password("password123"),
                "phone": phone,
                "city": city,
                "state": state,
                "country": country,
                "role": role,
                "about_me": None,
                "language": "English",
                "gender": None,
                "profile_pic_url": None,
                "created_at": now,
                "updated_at": now,
            }
        )
    db.users.insert_many(users)

    restaurants = [
        {
            "id": next_sequence(db, "restaurants"),
            "name": "Saffron Kitchen",
            "cuisine_type": "Indian",
            "description": "Modern Indian plates with a lively dinner atmosphere.",
            "address": "123 Market St",
            "city": "San Jose",
            "state": "CA",
            "country": "United States",
            "zip_code": "95113",
            "phone": "+1 4085550101",
            "hours": "Mon-Sun: 11am-10pm",
            "image_url": "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1200&q=80",
            "price_tier": "$$",
            "amenities": ["Reservations", "Takeout"],
            "avg_rating": 4.7,
            "review_count": 2,
            "view_count": 0,
            "owner_id": user_ids["owner@example.com"],
            "photos": [],
            "activity_logs": [],
            "created_at": now,
            "updated_at": now,
        },
        {
            "id": next_sequence(db, "restaurants"),
            "name": "Harbor Taco",
            "cuisine_type": "Mexican",
            "description": "Casual taco spot with fast service and outdoor seating.",
            "address": "55 Santa Clara Ave",
            "city": "Santa Clara",
            "state": "CA",
            "country": "United States",
            "zip_code": "95050",
            "phone": "+1 4085550102",
            "hours": "Tue-Sun: 10am-9pm",
            "image_url": "https://images.unsplash.com/photo-1565299585323-38174c4a6471?auto=format&fit=crop&w=1200&q=80",
            "price_tier": "$",
            "amenities": ["Outdoor Seating"],
            "avg_rating": 4.2,
            "review_count": 1,
            "view_count": 0,
            "owner_id": user_ids["carlos.owner@example.com"],
            "photos": [],
            "activity_logs": [],
            "created_at": now,
            "updated_at": now,
        },
        {
            "id": next_sequence(db, "restaurants"),
            "name": "Golden Ramen House",
            "cuisine_type": "Japanese",
            "description": "Cozy ramen bar with rich broths, yakitori, and late-night bowls.",
            "address": "742 Castro St",
            "city": "Mountain View",
            "state": "CA",
            "country": "United States",
            "zip_code": "94041",
            "phone": "+1 6505550103",
            "hours": "Daily: 12pm-11pm",
            "image_url": "https://images.unsplash.com/photo-1611143669185-af224c5e3252?auto=format&fit=crop&w=1200&q=80",
            "price_tier": "$$",
            "amenities": ["Takeout", "Late Night"],
            "avg_rating": 4.8,
            "review_count": 2,
            "view_count": 0,
            "owner_id": user_ids["nina.owner@example.com"],
            "photos": [],
            "activity_logs": [],
            "created_at": now,
            "updated_at": now,
        },
        {
            "id": next_sequence(db, "restaurants"),
            "name": "Bella Vista Osteria",
            "cuisine_type": "Italian",
            "description": "Neighborhood Italian dining with handmade pasta and candlelit service.",
            "address": "18 University Ave",
            "city": "Palo Alto",
            "state": "CA",
            "country": "United States",
            "zip_code": "94301",
            "phone": "+1 6505550104",
            "hours": "Mon-Sat: 5pm-10pm",
            "image_url": "https://images.unsplash.com/photo-1552566626-52f8b828add9?auto=format&fit=crop&w=1200&q=80",
            "price_tier": "$$$",
            "amenities": ["Reservations", "Wine"],
            "avg_rating": 4.4,
            "review_count": 2,
            "view_count": 0,
            "owner_id": user_ids["nina.owner@example.com"],
            "photos": [],
            "activity_logs": [],
            "created_at": now,
            "updated_at": now,
        },
        {
            "id": next_sequence(db, "restaurants"),
            "name": "Green Garden Cafe",
            "cuisine_type": "Mediterranean",
            "description": "Bright cafe serving vegan bowls, wraps, smoothies, and mezze plates.",
            "address": "200 Murphy Ave",
            "city": "Sunnyvale",
            "state": "CA",
            "country": "United States",
            "zip_code": "94086",
            "phone": "+1 4085550105",
            "hours": "Daily: 8am-8pm",
            "image_url": "https://images.unsplash.com/photo-1541544741938-0af808871cc0?auto=format&fit=crop&w=1200&q=80",
            "price_tier": "$$",
            "amenities": ["Vegan Options", "Outdoor Seating"],
            "avg_rating": 4.6,
            "review_count": 2,
            "view_count": 0,
            "owner_id": user_ids["owner@example.com"],
            "photos": [],
            "activity_logs": [],
            "created_at": now,
            "updated_at": now,
        },
        {
            "id": next_sequence(db, "restaurants"),
            "name": "Maple & Smoke",
            "cuisine_type": "American",
            "description": "Craft burgers, smoked brisket, and cocktails in a lively sports-bar setting.",
            "address": "410 First St",
            "city": "San Jose",
            "state": "CA",
            "country": "United States",
            "zip_code": "95112",
            "phone": "+1 4085550106",
            "hours": "Daily: 11am-12am",
            "image_url": "https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=1200&q=80",
            "price_tier": "$$",
            "amenities": ["Outdoor Seating", "Full Bar"],
            "avg_rating": 4.1,
            "review_count": 1,
            "view_count": 0,
            "owner_id": user_ids["carlos.owner@example.com"],
            "photos": [],
            "activity_logs": [],
            "created_at": now,
            "updated_at": now,
        },
        {
            "id": next_sequence(db, "restaurants"),
            "name": "Skyline Social",
            "cuisine_type": "American",
            "description": "Rooftop-style dining with wifi, quiet weekday corners, and outdoor seating.",
            "address": "88 River St",
            "city": "San Jose",
            "state": "CA",
            "country": "United States",
            "zip_code": "95110",
            "phone": "+1 4085550107",
            "hours": "Daily: 4pm-11pm",
            "image_url": "https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&w=1200&q=80",
            "price_tier": "$$$",
            "amenities": ["Outdoor Seating", "Wifi", "Quiet"],
            "avg_rating": 0.0,
            "review_count": 0,
            "view_count": 0,
            "owner_id": None,
            "photos": [],
            "activity_logs": [],
            "created_at": now,
            "updated_at": now,
        },
    ]
    db.restaurants.insert_many(restaurants)

    restaurant_by_name = {restaurant["name"]: restaurant["id"] for restaurant in restaurants}

    reviews = [
        ("user@example.com", "Saffron Kitchen", 5, "Excellent food and quick service."),
        ("ava@example.com", "Saffron Kitchen", 4, "Loved the paneer tikka and desserts."),
        ("user@example.com", "Harbor Taco", 4, "Fresh tacos and great outdoor seating."),
        ("noah@example.com", "Golden Ramen House", 5, "Broth was rich and the noodles were perfect."),
        ("ava@example.com", "Golden Ramen House", 5, "Late-night ramen done really well."),
        ("ava@example.com", "Bella Vista Osteria", 4, "Great pasta and date-night ambience."),
        ("user@example.com", "Bella Vista Osteria", 5, "Fantastic tiramisu and attentive staff."),
        ("noah@example.com", "Green Garden Cafe", 4, "Healthy menu with plenty of vegan options."),
        ("user@example.com", "Green Garden Cafe", 5, "Loved the falafel bowl and smoothies."),
        ("ava@example.com", "Maple & Smoke", 4, "Good burger and fun game-day vibe."),
    ]
    db.reviews.insert_many(
        [
            {
                "id": next_sequence(db, "reviews"),
                "user_id": user_ids[email],
                "restaurant_id": restaurant_by_name[restaurant_name],
                "rating": rating,
                "comment": comment,
                "status": "processed",
                "created_at": now,
                "updated_at": now,
            }
            for email, restaurant_name, rating, comment in reviews
        ]
    )

    favorites = [
        ("user@example.com", "Saffron Kitchen"),
        ("user@example.com", "Golden Ramen House"),
        ("ava@example.com", "Bella Vista Osteria"),
        ("ava@example.com", "Green Garden Cafe"),
        ("noah@example.com", "Golden Ramen House"),
        ("noah@example.com", "Maple & Smoke"),
    ]
    db.favorites.insert_many(
        [
            {
                "id": next_sequence(db, "favorites"),
                "user_id": user_ids[email],
                "restaurant_id": restaurant_by_name[restaurant_name],
                "created_at": now,
            }
            for email, restaurant_name in favorites
        ]
    )

    preferences = [
        {
            "email": "user@example.com",
            "cuisines": ["Indian", "Thai", "Japanese"],
            "price_range": "$$",
            "location": "San Jose",
            "preferred_locations": ["San Jose", "Santa Clara"],
            "search_radius": 10,
            "dietary_needs": [],
            "ambiance": ["Casual", "Outdoor"],
            "sort_preference": "rating",
        },
        {
            "email": "ava@example.com",
            "cuisines": ["Italian", "Mediterranean", "Mexican"],
            "price_range": "$$$",
            "location": "Palo Alto",
            "preferred_locations": ["Palo Alto", "Sunnyvale"],
            "search_radius": 15,
            "dietary_needs": ["Vegetarian"],
            "ambiance": ["Romantic", "Fine Dining"],
            "sort_preference": "distance",
        },
        {
            "email": "noah@example.com",
            "cuisines": ["Japanese", "American"],
            "price_range": "$$",
            "location": "Mountain View",
            "preferred_locations": ["Mountain View", "San Jose"],
            "search_radius": 20,
            "dietary_needs": [],
            "ambiance": ["Family-Friendly"],
            "sort_preference": "popularity",
        },
    ]
    db.user_preferences.insert_many(
        [
            {
                "id": next_sequence(db, "user_preferences"),
                "user_id": user_ids[item["email"]],
                "cuisines": item["cuisines"],
                "price_range": item["price_range"],
                "location": item["location"],
                "preferred_locations": item["preferred_locations"],
                "search_radius": item["search_radius"],
                "dietary_needs": item["dietary_needs"],
                "ambiance": item["ambiance"],
                "sort_preference": item["sort_preference"],
                "created_at": now,
                "updated_at": now,
            }
            for item in preferences
        ]
    )

    print("MongoDB seed complete.")


if __name__ == "__main__":
    seed()
