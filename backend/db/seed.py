"""
Seed script — populates yelp_db with sample data for development/testing.

Usage:
    cd backend
    source venv/bin/activate
    python db/seed.py
"""

import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from dotenv import load_dotenv

load_dotenv()

from db.database import SessionLocal
from models.models import User, Restaurant, Review, UserPreference
from services.auth import hash_password


def seed():
    db = SessionLocal()

    # ── Check if data exists ──
    if db.query(User).count() > 0:
        print("⚠️  Database already has data. Skipping seed.")
        db.close()
        return

    print("🌱 Seeding database...")

    # ── Users ──
    users = [
        User(
            name="Prakhar Singh",
            email="prakhar@demo.com",
            password_hash=hash_password("password123"),
            phone="555-0101",
            about_me="Full-stack developer who loves good food.",
            city="San Jose",
            state="CA",
            country="United States",
            language="English",
            gender="male",
            role="user",
        ),
        User(
            name="Nikhil Khaneja",
            email="nikhil@demo.com",
            password_hash=hash_password("password123"),
            phone="555-0102",
            about_me="Frontend engineer and foodie.",
            city="San Francisco",
            state="CA",
            country="United States",
            language="English",
            gender="male",
            role="user",
        ),
        User(
            name="Restaurant Owner",
            email="owner@demo.com",
            password_hash=hash_password("password123"),
            phone="555-0103",
            about_me="Proud owner of multiple restaurants.",
            city="San Jose",
            state="CA",
            country="United States",
            role="owner",
        ),
    ]
    db.add_all(users)
    db.flush()

    # ── User Preferences ──
    prefs = UserPreference(
        user_id=users[0].id,
        cuisines=["Italian", "Japanese", "Indian"],
        price_range="$$",
        location="San Jose",
        preferred_locations=["San Jose", "San Francisco", "Palo Alto"],
        search_radius=15,
        dietary_needs=["vegetarian"],
        ambiance=["casual", "family-friendly"],
        sort_preference="rating",
    )
    db.add(prefs)

    # ── Restaurants ──
    restaurants = [
        Restaurant(
            name="Pasta Paradise",
            cuisine_type="Italian",
            description="Authentic Italian pasta and wood-fired pizzas in a cozy setting.",
            address="123 Main St",
            city="San Jose",
            zip="95112",
            phone="408-555-0001",
            hours="Mon-Sun 11:00 AM - 10:00 PM",
            price_tier="$$",
            amenities=["wifi", "outdoor seating", "family-friendly"],
            created_by=users[0].id,
            avg_rating=4.50,
            review_count=2,
        ),
        Restaurant(
            name="Sakura Sushi",
            cuisine_type="Japanese",
            description="Premium sushi and sashimi with fresh, daily-sourced fish.",
            address="456 2nd Ave",
            city="San Jose",
            zip="95113",
            phone="408-555-0002",
            hours="Tue-Sun 12:00 PM - 9:30 PM",
            price_tier="$$$",
            amenities=["quiet", "romantic"],
            created_by=users[0].id,
            avg_rating=4.70,
            review_count=1,
        ),
        Restaurant(
            name="Spice Kingdom",
            cuisine_type="Indian",
            description="North Indian curries, biryanis, and tandoori specialties.",
            address="789 Curry Ln",
            city="San Jose",
            zip="95112",
            phone="408-555-0003",
            hours="Mon-Sun 11:30 AM - 10:30 PM",
            price_tier="$$",
            amenities=["vegan options", "family-friendly", "outdoor seating"],
            created_by=users[1].id,
            avg_rating=4.30,
            review_count=1,
        ),
        Restaurant(
            name="Taco Fiesta",
            cuisine_type="Mexican",
            description="Vibrant Mexican street food, tacos, burritos, and margaritas.",
            address="321 Fiesta Blvd",
            city="San Francisco",
            zip="94110",
            phone="415-555-0004",
            hours="Mon-Sun 10:00 AM - 11:00 PM",
            price_tier="$",
            amenities=["outdoor seating", "family-friendly", "live music"],
            created_by=users[1].id,
            avg_rating=4.40,
            review_count=1,
        ),
        Restaurant(
            name="Green Leaf Café",
            cuisine_type="American",
            description="100% plant-based café with creative vegan dishes and smoothies.",
            address="555 Veggie Way",
            city="Palo Alto",
            zip="94301",
            phone="650-555-0005",
            hours="Mon-Sat 8:00 AM - 8:00 PM",
            price_tier="$$",
            amenities=["vegan", "gluten-free options", "wifi", "casual"],
            created_by=users[0].id,
            avg_rating=4.40,
            review_count=1,
        ),
        Restaurant(
            name="Candlelight Bistro",
            cuisine_type="French",
            description="Upscale French dining with an intimate, romantic atmosphere.",
            address="888 Romance Ave",
            city="San Francisco",
            zip="94102",
            phone="415-555-0006",
            hours="Wed-Sun 5:00 PM - 11:00 PM",
            price_tier="$$$$",
            amenities=["romantic", "fine dining", "wine bar"],
            owner_id=users[2].id,
            created_by=users[2].id,
            avg_rating=4.80,
            review_count=1,
        ),
    ]
    db.add_all(restaurants)
    db.flush()

    # ── Reviews ──
    reviews = [
        Review(user_id=users[0].id, restaurant_id=restaurants[0].id, rating=5,
               comment="Best pasta I've had in San Jose! The carbonara is to die for."),
        Review(user_id=users[1].id, restaurant_id=restaurants[0].id, rating=4,
               comment="Great atmosphere and delicious pizza. Slightly slow service."),
        Review(user_id=users[0].id, restaurant_id=restaurants[1].id, rating=5,
               comment="Incredibly fresh sushi. The omakase is a must-try."),
        Review(user_id=users[1].id, restaurant_id=restaurants[2].id, rating=4,
               comment="Flavorful curries and excellent naan. Generous portions."),
        Review(user_id=users[0].id, restaurant_id=restaurants[3].id, rating=4,
               comment="Authentic tacos and great margaritas. Fun vibe!"),
        Review(user_id=users[1].id, restaurant_id=restaurants[4].id, rating=5,
               comment="Amazing vegan food! You wouldn't know it's plant-based."),
        Review(user_id=users[0].id, restaurant_id=restaurants[5].id, rating=5,
               comment="Perfect anniversary dinner. Stunning ambiance and food."),
    ]
    db.add_all(reviews)
    db.flush()

    db.commit()
    print(f"✅ Seeded: {len(users)} users, {len(restaurants)} restaurants, {len(reviews)} reviews")
    db.close()


if __name__ == "__main__":
    seed()
