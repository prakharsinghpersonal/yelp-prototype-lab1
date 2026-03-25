#!/usr/bin/env python3
"""
Comprehensive seed database script with extensive test data
"""
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from sqlalchemy.orm import Session
from sqlalchemy import text
from db.database import engine, SessionLocal, Base
from models.models import User, Restaurant, Review, Favorite, UserPreference
from services.auth import hash_password

def seed_database():
    """Populate database with comprehensive test data"""
    db = SessionLocal()
    
    try:
        print("🏗️  Creating tables...")
        # Create tables if they don't exist
        Base.metadata.create_all(bind=engine)
        print("✅ Tables created or already exist")
        
        print("🗑️  Clearing existing data...")
        # Clear existing data using raw SQL to bypass foreign key constraints
        try:
            db.execute(text("SET FOREIGN_KEY_CHECKS=0"))
            db.execute(text("TRUNCATE TABLE favorites"))
            db.execute(text("TRUNCATE TABLE reviews"))
            db.execute(text("TRUNCATE TABLE restaurants"))
            db.execute(text("TRUNCATE TABLE user_preferences"))
            db.execute(text("TRUNCATE TABLE users"))
            db.execute(text("SET FOREIGN_KEY_CHECKS=1"))
            db.commit()
            print("✅ Database cleared")
        except Exception as e:
            db.rollback()
            print(f"ℹ️  Continuing with partial data clearance...")
        
        # ========== CREATE TEST USERS ==========
        print("\n👤 Creating test users...")
        users_data = [
            ("prakhar@demo.com", "Prakhar Singh", "password123", "555-0001", "San Jose"),
            ("nikhil@demo.com", "Nikhil Khaneja", "password123", "555-0002", "San Francisco"),
            ("sarah@demo.com", "Sarah Johnson", "password123", "555-0003", "Palo Alto"),
            ("mike@demo.com", "Mike Chen", "password123", "555-0004", "San Jose"),
            ("priya@demo.com", "Priya Patel", "password123", "555-0005", "Mountain View"),
            ("john@demo.com", "John Smith", "password123", "555-0006", "San Francisco"),
            ("emma@demo.com", "Emma Wilson", "password123", "555-0007", "Cupertino"),
            ("raj@demo.com", "Raj Kumar", "password123", "555-0008", "San Jose"),
            ("lisa@demo.com", "Lisa Anderson", "password123", "555-0009", "Palo Alto"),
            ("owner@demo.com", "Restaurant Owner", "password123", "555-0010", "San Jose"),
        ]
        
        users = []
        for email, name, password, phone, city in users_data:
            user = User(
                name=name,
                email=email,
                password_hash=hash_password(password),
                phone=phone,
                city=city,
                state="CA",
                country="United States",
                language="English",
                gender="male" if email not in ["sarah@demo.com", "priya@demo.com", "emma@demo.com", "lisa@demo.com"] else "female",
                about_me=f"{name} loves discovering great restaurants",
                role="owner" if email == "owner@demo.com" else "user"
            )
            users.append(user)
            db.add(user)
        
        db.commit()
        print(f"   ✅ Created {len(users)} users")
        
        # ========== CREATE RESTAURANTS ==========
        print("🍽️  Creating restaurants...")
        owner = db.query(User).filter(User.email == "owner@demo.com").first()
        
        restaurants_data = [
            # Chinese
            ("Golden Dragon", "Chinese", "Authentic Chinese cuisine", "123 Main St", "San Jose", "95110", "408-555-0101", "$$"),
            ("Pearl Garden", "Chinese", "Modern Chinese fusion", "456 Oak Ave", "San Francisco", "94102", "415-555-0102", "$$$"),
            ("Panda Express Style", "Chinese", "Quick Chinese meals", "789 Elm St", "Palo Alto", "94301", "650-555-0103", "$"),
            
            # Italian
            ("La Bella Italia", "Italian", "Traditional Italian pasta", "111 Park Ln", "San Francisco", "94103", "415-555-0201", "$$$"),
            ("Trattoria Roma", "Italian", "Family-style Italian", "222 Market St", "San Jose", "95111", "408-555-0202", "$$"),
            ("Pizzeria Napoli", "Italian", "Wood-fired pizza", "333 Main St", "Palo Alto", "94302", "650-555-0203", "$$"),
            
            # Indian
            ("Curry Palace", "Indian", "South & North Indian", "444 River Rd", "San Jose", "95112", "408-555-0301", "$$"),
            ("Spice Route", "Indian", "Modern Indian cuisine", "555 Grove St", "San Francisco", "94104", "415-555-0302", "$$$"),
            ("Tandoor House", "Indian", "Traditional tandoori", "666 First St", "Mountain View", "94040", "650-555-0303", "$$"),
            
            # Japanese
            ("Tokyo Sushi House", "Japanese", "Fresh sushi & sashimi", "777 Ocean Ave", "Palo Alto", "94303", "650-555-0401", "$$$"),
            ("Ramen Paradise", "Japanese", "Authentic ramen", "888 Bay St", "San Francisco", "94105", "415-555-0402", "$$"),
            ("Sakura Sushi", "Japanese", "Casual sushi bar", "999 Street Rd", "San Jose", "95113", "408-555-0403", "$$"),
            
            # Mexican
            ("Taco Fiesta", "Mexican", "Street tacos & burritos", "1111 Park Ave", "San Jose", "95114", "408-555-0501", "$"),
            ("El Mariachi", "Mexican", "Upscale Mexican", "2222 Mission St", "San Francisco", "94106", "415-555-0502", "$$"),
            ("Cantina Mexicana", "Mexican", "Traditional Mexican", "3333 Castro St", "Mountain View", "94041", "650-555-0503", "$$"),
            
            # American
            ("The Burger Spot", "American", "Gourmet burgers", "4444 Van Ness", "San Francisco", "94107", "415-555-0601", "$$"),
            ("Steak House Prime", "American", "Premium steaks", "5555 Park Blvd", "Palo Alto", "94304", "650-555-0602", "$$$"),
            ("Diner Classic", "American", "Classic American diner", "6666 Main Ave", "San Jose", "95115", "408-555-0603", "$"),
            
            # Thai
            ("Thai Orchid", "Thai", "Authentic Thai cuisine", "7777 Folsom St", "San Francisco", "94108", "415-555-0701", "$$"),
            ("Pad Thai House", "Thai", "Popular Thai spot", "8888 Santa Clara", "San Jose", "95116", "408-555-0702", "$"),
            
            # Mediterranean
            ("Mediterranean Blues", "Mediterranean", "Greek and Mediterranean", "9999 Geary St", "San Francisco", "94109", "415-555-0801", "$$"),
            ("Greek Island", "Mediterranean", "Island-inspired cuisine", "1010 El Camino", "Palo Alto", "94305", "650-555-0802", "$$"),
        ]
        
        restaurants = []
        for name, cuisine, desc, addr, city, zip_code, phone, price in restaurants_data:
            restaurant = Restaurant(
                name=name,
                cuisine_type=cuisine,
                description=desc,
                address=addr,
                city=city,
                state="CA",
                zip_code=zip_code,
                phone=phone,
                hours="Mon-Sun 11am-10pm",
                price_tier=price,
                amenities=["wifi", "parking"],
                owner_id=owner.id,
                avg_rating=0,
                review_count=0
            )
            restaurants.append(restaurant)
            db.add(restaurant)
        
        db.commit()
        print(f"   ✅ Created {len(restaurants)} restaurants")
        
        # ========== CREATE REVIEWS ==========
        print("📝 Creating reviews and ratings...")
        prakhar = db.query(User).filter(User.email == "prakhar@demo.com").first()
        nikhil = db.query(User).filter(User.email == "nikhil@demo.com").first()
        sarah = db.query(User).filter(User.email == "sarah@demo.com").first()
        mike = db.query(User).filter(User.email == "mike@demo.com").first()
        
        review_data = [
            (prakhar.id, restaurants[0].id, 5, "Amazing food! Best Chinese restaurant in San Jose."),
            (prakhar.id, restaurants[1].id, 4, "Good pasta, loved the ambiance."),
            (prakhar.id, restaurants[3].id, 5, "Best sushi I've had! Fresh and authentic."),
            (nikhil.id, restaurants[0].id, 4, "Great service and delicious dishes."),
            (nikhil.id, restaurants[4].id, 5, "Best sushi rolls in the city!"),
            (nikhil.id, restaurants[6].id, 4, "Wood-fired pizza is excellent."),
            (sarah.id, restaurants[2].id, 5, "Fantastic Indian food, highly recommend!"),
            (sarah.id, restaurants[5].id, 3, "Good, but a bit pricey."),
            (sarah.id, restaurants[12].id, 5, "Street tacos are perfection!"),
            (mike.id, restaurants[9].id, 4, "Great sushi with friendly staff."),
            (mike.id, restaurants[15].id, 5, "Amazing burgers! Will come back."),
            (mike.id, restaurants[3].id, 4, "Good Italian, cozy atmosphere."),
        ]
        
        reviews = []
        for user_id, restaurant_id, rating, comment in review_data:
            review = Review(
                user_id=user_id,
                restaurant_id=restaurant_id,
                rating=rating,
                comment=comment
            )
            reviews.append(review)
            db.add(review)
        
        db.commit()
        print(f"   ✅ Created {len(reviews)} reviews")
        
        # Update restaurant ratings
        for restaurant in restaurants:
            res_reviews = db.query(Review).filter(Review.restaurant_id == restaurant.id).all()
            if res_reviews:
                avg_rating = sum(r.rating for r in res_reviews) / len(res_reviews)
                restaurant.avg_rating = round(avg_rating, 1)
                restaurant.review_count = len(res_reviews)
        db.commit()
        
        # ========== CREATE FAVORITES ==========
        print("⭐ Creating favorites...")
        favorites_data = [
            (prakhar.id, restaurants[0].id),
            (prakhar.id, restaurants[1].id),
            (prakhar.id, restaurants[3].id),
            (nikhil.id, restaurants[4].id),
            (nikhil.id, restaurants[6].id),
            (nikhil.id, restaurants[9].id),
            (sarah.id, restaurants[2].id),
            (sarah.id, restaurants[5].id),
            (sarah.id, restaurants[12].id),
            (mike.id, restaurants[9].id),
            (mike.id, restaurants[15].id),
            (mike.id, restaurants[3].id),
        ]
        
        favorites = []
        for user_id, restaurant_id in favorites_data:
            favorite = Favorite(user_id=user_id, restaurant_id=restaurant_id)
            favorites.append(favorite)
            db.add(favorite)
        
        db.commit()
        print(f"   ✅ Created {len(favorites)} favorites")
        
        # ========== CREATE USER PREFERENCES ==========
        print("🎯 Creating user preferences...")
        try:
            preferences_data = [
                (prakhar.id, "Chinese, Italian", "$$", "San Jose", "None", "Casual"),
                (nikhil.id, "Japanese, Italian", "$$$", "San Francisco", "Vegetarian", "Upscale"),
                (sarah.id, "Indian, Mediterranean", "$$", "Palo Alto", "Vegan", "Casual"),
                (mike.id, "All", "$$", "San Jose", "None", "Family-friendly"),
            ]
            
            preferences = []
            for user_id, cuisines, price, loc, dietary, ambiance in preferences_data:
                pref = UserPreference(
                    user_id=user_id,
                    cuisines=cuisines,
                    price_range=price,
                    location=loc,
                    dietary=dietary,
                    ambiance=ambiance
                )
                preferences.append(pref)
                db.add(pref)
            
            db.commit()
            print(f"   ✅ Created {len(preferences)} user preferences")
        except Exception as e:
            db.rollback()
            print(f"   ⚠️  Skipped user preferences (schema mismatch): {str(e)[:50]}...")
        
        print("\n✅ Database seeding complete!")
        print(f"\n📊 Summary:")
        print(f"   Users: {len(users)}")
        print(f"   Restaurants: {len(restaurants)}")
        print(f"   Reviews: {len(reviews)}")
        print(f"   Favorites: {len(favorites)}")
        print(f"   Preferences: {len(preferences)}")
        
    except Exception as e:
        print(f"❌ Error seeding database: {e}")
        db.rollback()
        raise
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()
