#!/usr/bin/env python3
"""
Seed database with sample data for testing
"""
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from sqlalchemy.orm import Session
from db.database import engine, SessionLocal, Base
from models.models import User, Restaurant, Review, UserPreference
from services.auth import hash_password
from datetime import datetime

def seed_database():
    """Populate database with sample test data"""
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    
    try:
        # Check if data already exists
        user_count = db.query(User).count()
        if user_count > 0:
            print("✅ Database already seeded. Skipping...")
            return
        
        # Create test users
        print("👤 Creating test users...")
        users = [
            User(
                name="Prakhar Singh",
                email="prakhar@demo.com",
                password_hash=hash_password("password123"),
                phone="555-0001",
                about_me="Food enthusiast and tech lover",
                city="San Jose",
                state="CA",
                country="United States",
                language="English",
                gender="male",
                role="user"
            ),
            User(
                name="Nikhil Khaneja",
                email="nikhil@demo.com",
                password_hash=hash_password("password123"),
                phone="555-0002",
                about_me="UI/UX designer interested in restaurants",
                city="San Francisco",
                state="CA",
                country="United States",
                language="English",
                gender="male",
                role="user"
            ),
            User(
                name="Restaurant Owner",
                email="owner@demo.com",
                password_hash=hash_password("password123"),
                phone="555-0003",
                about_me="Proud restaurant owner",
                city="San Jose",
                state="CA",
                country="United States",
                language="English",
                gender="male",
                role="owner"
            ),
        ]
        
        for user in users:
            db.add(user)
        db.commit()
        print(f"   ✅ Created {len(users)} users")
        
        # Get users for relationships
        prakhar = db.query(User).filter(User.email == "prakhar@demo.com").first()
        nikhil = db.query(User).filter(User.email == "nikhil@demo.com").first()
        owner = db.query(User).filter(User.email == "owner@demo.com").first()
        
        # Create test restaurants
        print("🍽️ Creating test restaurants...")
        restaurants = [
            Restaurant(
                name="Golden Dragon",
                cuisine_type="Chinese",
                description="Authentic Chinese cuisine with fresh ingredients",
                address="123 Main Street",
                city="San Jose",
                state="CA",
                zip_code="95110",
                phone="408-555-0001",
                hours="Mon-Sun 11am-10pm",
                price_tier="$$",
                amenities=["wifi", "parking", "outdoor_seating"],
                owner_id=owner.id,
                avg_rating=4.5,
                review_count=0
            ),
            Restaurant(
                name="La Bella Italia",
                cuisine_type="Italian",
                description="Traditional Italian restaurant with homemade pasta",
                address="456 Oak Avenue",
                city="San Francisco",
                state="CA",
                zip_code="94102",
                phone="415-555-0002",
                hours="Tue-Sun 5pm-11pm",
                price_tier="$$$",
                amenities=["wine_selection", "romantic", "reservations"],
                owner_id=owner.id,
                avg_rating=4.8,
                review_count=0
            ),
            Restaurant(
                name="Curry Palace",
                cuisine_type="Indian",
                description="South Indian and North Indian specialties",
                address="789 Park Lane",
                city="San Jose",
                state="CA",
                zip_code="95112",
                phone="408-555-0003",
                hours="Mon-Sun 11:30am-10pm",
                price_tier="$$",
                amenities=["vegetarian_options", "family_friendly", "takeout"],
                owner_id=owner.id,
                avg_rating=4.3,
                review_count=0
            ),
            Restaurant(
                name="Tokyo Sushi House",
                cuisine_type="Japanese",
                description="Fresh sushi and authentic Japanese dishes",
                address="321 River Road",
                city="Palo Alto",
                state="CA",
                zip_code="94301",
                phone="650-555-0004",
                hours="Mon-Sat 11am-10pm, Sun 12pm-9pm",
                price_tier="$$$",
                amenities=["sushi_bar", "parking", "reservations"],
                owner_id=owner.id,
                avg_rating=4.7,
                review_count=0
            ),
            Restaurant(
                name="Taco Fiesta",
                cuisine_type="Mexican",
                description="Casual Mexican restaurant with fresh ingredients",
                address="654 Corona Street",
                city="San Jose",
                state="CA",
                zip_code="95126",
                phone="408-555-0005",
                hours="Mon-Sun 10am-11pm",
                price_tier="$",
                amenities=["outdoor_seating", "family_friendly", "vegetarian_options"],
                owner_id=owner.id,
                avg_rating=4.2,
                review_count=0
            ),
            Restaurant(
                name="Burger Barn",
                cuisine_type="American",
                description="Classic American burgers and comfort food",
                address="987 Main Plaza",
                city="Mountain View",
                state="CA",
                zip_code="94040",
                phone="650-555-0006",
                hours="Mon-Sun 11am-10pm",
                price_tier="$",
                amenities=["drive_through", "parking", "wifi"],
                owner_id=owner.id,
                avg_rating=4.0,
                review_count=0
            ),
        ]
        
        for restaurant in restaurants:
            db.add(restaurant)
        db.commit()
        print(f"   ✅ Created {len(restaurants)} restaurants")
        
        # Get restaurants for reviews
        golden_dragon = db.query(Restaurant).filter(Restaurant.name == "Golden Dragon").first()
        bella_italia = db.query(Restaurant).filter(Restaurant.name == "La Bella Italia").first()
        curry = db.query(Restaurant).filter(Restaurant.name == "Curry Palace").first()
        
        # Create test reviews
        print("⭐ Creating test reviews...")
        reviews = [
            Review(
                user_id=prakhar.id,
                restaurant_id=golden_dragon.id,
                rating=5,
                comment="Excellent food! The Kung Pao chicken was amazing. Will definitely come back!"
            ),
            Review(
                user_id=nikhil.id,
                restaurant_id=golden_dragon.id,
                rating=4,
                comment="Good quality and fast service. A bit busy during dinner time."
            ),
            Review(
                user_id=prakhar.id,
                restaurant_id=bella_italia.id,
                rating=5,
                comment="The pasta was homemade and delicious. Perfect ambiance for a date night!"
            ),
            Review(
                user_id=nikhil.id,
                restaurant_id=curry.id,
                rating=4,
                comment="Great vegetarian options. The paneer butter masala was creamy and flavorful."
            ),
        ]
        
        for review in reviews:
            db.add(review)
        
        db.commit()
        print(f"   ✅ Created {len(reviews)} reviews")
        
        # Update restaurant ratings
        print("📊 Updating restaurant ratings...")
        for restaurant in restaurants:
            rev_list = db.query(Review).filter(Review.restaurant_id == restaurant.id).all()
            if rev_list:
                restaurant.review_count = len(rev_list)
                restaurant.avg_rating = sum(r.rating for r in rev_list) / len(rev_list)
        db.commit()
        print("   ✅ Ratings updated")
        
        # Create user preferences for AI chatbot
        print("🤖 Creating user preferences...")
        prefs = [
            UserPreference(
                user_id=prakhar.id,
                cuisines=["Chinese", "Indian", "Italian"],
                price_range="$$",
                location="San Jose",
                dietary=["vegetarian"],
                ambiance=["casual"],
                sort_preference="rating"
            ),
            UserPreference(
                user_id=nikhil.id,
                cuisines=["Italian", "Japanese"],
                price_range="$$$",
                location="San Francisco",
                dietary=[],
                ambiance=["romantic"],
                sort_preference="rating"
            ),
        ]
        
        for pref in prefs:
            db.add(pref)
        db.commit()
        print(f"   ✅ Created {len(prefs)} preference sets")
        
        print("\n✨ Database seeding complete!")
        print("\n📝 Test Credentials:")
        print("   Email: prakhar@demo.com")
        print("   Password: password123")
        print("   OR")
        print("   Email: nikhil@demo.com")
        print("   Password: password123")
        
    except Exception as e:
        print(f"❌ Error seeding database: {e}")
        db.rollback()
        raise
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()
