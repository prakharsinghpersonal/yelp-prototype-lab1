"""
Seed script — populates the SQLite DB with 12 real-world-style restaurants.
Run once: python3 seed_db.py
"""
from db.database import SessionLocal, engine, Base
from models.models import Restaurant, User
from services.auth import hash_password

Base.metadata.create_all(bind=engine)

restaurants = [
    {
        "name": "Carbone",
        "cuisine_type": "Italian",
        "description": "Iconic Greenwich Village red-sauce Italian institution known for its theatrical service and classic dishes like spicy rigatoni vodka and veal parmesan.",
        "address": "181 Thompson St",
        "city": "New York",
        "zip_code": "10012",
        "phone": "+1 212-254-3000",
        "hours": "Mon–Sun: 5:30 PM – 11:00 PM",
        "price_tier": "$$$",
        "avg_rating": 4.7,
        "review_count": 2841,
        "amenities": ["Reservations Required", "Full Bar", "Valet Parking"],
        "image_url": "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600",
    },
    {
        "name": "Nobu Malibu",
        "cuisine_type": "Japanese",
        "description": "Perched above the Pacific Ocean, Nobu Malibu serves Chef Nobu Matsuhisa's legendary Japanese-Peruvian fusion. Famous for black cod miso and yellowtail jalapeño.",
        "address": "22706 Pacific Coast Hwy",
        "city": "Malibu",
        "zip_code": "90265",
        "phone": "+1 310-317-9140",
        "hours": "Mon–Thu: 5 PM – 10 PM, Fri–Sun: 11:30 AM – 11 PM",
        "price_tier": "$$$$",
        "avg_rating": 4.6,
        "review_count": 3120,
        "amenities": ["Ocean View", "Full Bar", "Outdoor Seating", "Valet Parking"],
        "image_url": "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=600",
    },
    {
        "name": "Franklin Barbecue",
        "cuisine_type": "American",
        "description": "Austin's most celebrated BBQ spot. Pitmaster Aaron Franklin's brisket has been called the best in the world by Bon Appétit. Cash only, arrive early — lines form before dawn.",
        "address": "900 E 11th St",
        "city": "Austin",
        "zip_code": "78702",
        "phone": "+1 512-653-1187",
        "hours": "Tue–Sun: 11 AM – sell out (usually by 1 PM)",
        "price_tier": "$$",
        "avg_rating": 4.8,
        "review_count": 5673,
        "amenities": ["Outdoor Seating", "Cash Only"],
        "image_url": "https://images.unsplash.com/photo-1544025162-d76694265947?w=600",
    },
    {
        "name": "Alinea",
        "cuisine_type": "American",
        "description": "Three-Michelin-star avant-garde dining experience by Chef Grant Achatz in Chicago's Lincoln Park. The edible balloon dessert is Instagram legend.",
        "address": "1723 N Halsted St",
        "city": "Chicago",
        "zip_code": "60614",
        "phone": "+1 312-867-0110",
        "hours": "Wed–Sun: 5 PM – 9 PM",
        "price_tier": "$$$$",
        "avg_rating": 4.9,
        "review_count": 1987,
        "amenities": ["Reservations Required", "Wine Pairing", "Fine Dining"],
        "image_url": "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600",
    },
    {
        "name": "Tartine Bakery",
        "cuisine_type": "Mediterranean",
        "description": "San Francisco legend and birthplace of country bread fever. The afternoon bread rush at 5 PM draws lines around the block. Also known for morning buns and croque monsieur.",
        "address": "600 Guerrero St",
        "city": "San Francisco",
        "zip_code": "94110",
        "phone": "+1 415-487-2600",
        "hours": "Mon: 8 AM – 3 PM, Tue–Wed: Closed, Thu–Fri: 8 AM – 7 PM, Sat–Sun: 8 AM – 6 PM",
        "price_tier": "$",
        "avg_rating": 4.5,
        "review_count": 4201,
        "amenities": ["Takeout", "Bakery", "Coffee"],
        "image_url": "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600",
    },
    {
        "name": "Pujol",
        "cuisine_type": "Mexican",
        "description": "Chef Enrique Olvera's flagship restaurant in Mexico City consistently ranks in the World's 50 Best. The mole madre, aged over 1000 days, is a pilgrimage-worthy dish.",
        "address": "Tennyson 133, Polanco",
        "city": "Mexico City",
        "zip_code": "11560",
        "phone": "+52 55-5545-4111",
        "hours": "Mon–Sat: 1 PM – 10:30 PM",
        "price_tier": "$$$$",
        "avg_rating": 4.8,
        "review_count": 2234,
        "amenities": ["Reservations Required", "Tasting Menu", "Bar"],
        "image_url": "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=600",
    },
    {
        "name": "Russ & Daughters Cafe",
        "cuisine_type": "American",
        "description": "The appetizing shop that invented New York's Jewish deli culture since 1914. Famous for silky smoked salmon, bagels, and the Super Heebster sandwich.",
        "address": "127 Orchard St",
        "city": "New York",
        "zip_code": "10002",
        "phone": "+1 212-475-4881",
        "hours": "Mon–Fri: 8 AM – 10 PM, Sat–Sun: 8 AM – 11 PM",
        "price_tier": "$$",
        "avg_rating": 4.6,
        "review_count": 3876,
        "amenities": ["Takeout", "Delivery", "Brunch"],
        "image_url": "https://images.unsplash.com/photo-1533777857889-4be7c70b33f7?w=600",
    },
    {
        "name": "Night + Market Song",
        "cuisine_type": "Thai",
        "description": "LA's most exciting Thai restaurant from Chef Kris Yenbamroong. Northern Thai street food served in a lively Silver Lake setting. The khao soi and crispy rice salad are legendary.",
        "address": "3322 W Sunset Blvd",
        "city": "Los Angeles",
        "zip_code": "90026",
        "phone": "+1 323-665-5899",
        "hours": "Mon–Thu: 5 PM – 10 PM, Fri: 5 PM – 11 PM, Sat: 11 AM – 11 PM, Sun: 11 AM – 10 PM",
        "price_tier": "$$",
        "avg_rating": 4.5,
        "review_count": 2980,
        "amenities": ["Full Bar", "Outdoor Seating", "Reservations"],
        "image_url": "https://images.unsplash.com/photo-1562802378-063ec186a863?w=600",
    },
    {
        "name": "Zahav",
        "cuisine_type": "Mediterranean",
        "description": "James Beard Award-winning Israeli restaurant in Philadelphia by Chef Michael Solomonov. The hummus tehina and wood-roasted lamb shoulder are must-orders.",
        "address": "237 Saint James Pl",
        "city": "Philadelphia",
        "zip_code": "19106",
        "phone": "+1 215-625-8800",
        "hours": "Mon–Thu: 5 PM – 10 PM, Fri–Sat: 5 PM – 11 PM, Sun: 4:30 PM – 9 PM",
        "price_tier": "$$$",
        "avg_rating": 4.7,
        "review_count": 3142,
        "amenities": ["Full Bar", "Reservations", "Private Dining"],
        "image_url": "https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?w=600",
    },
    {
        "name": "Dhamaka",
        "cuisine_type": "Indian",
        "description": "NYC's boldest Indian restaurant from Chef Chintan Pandya celebrating rarely-seen regional Indian cuisine. Goat brain masala, whole roasted suckling pig — not your average tikka masala.",
        "address": "119 Delancey St",
        "city": "New York",
        "zip_code": "10002",
        "phone": "+1 212-614-0500",
        "hours": "Mon–Thu: 5 PM – 10 PM, Fri–Sat: 5 PM – 11 PM, Sun: 4 PM – 9 PM",
        "price_tier": "$$$",
        "avg_rating": 4.6,
        "review_count": 1654,
        "amenities": ["Full Bar", "Reservations", "Spicy Food Warning"],
        "image_url": "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=600",
    },
    {
        "name": "Husk Nashville",
        "cuisine_type": "American",
        "description": "Chef Sean Brock's shrine to Southern ingredients inside a historic Victorian mansion. Everything on the menu — every ingredient — is grown or raised in the American South.",
        "address": "37 Rutledge St",
        "city": "Nashville",
        "zip_code": "37210",
        "phone": "+1 615-256-6565",
        "hours": "Mon–Thu: 11 AM – 10 PM, Fri: 11 AM – 11 PM, Sat: 10 AM – 11 PM, Sun: 10 AM – 9 PM",
        "price_tier": "$$$",
        "avg_rating": 4.6,
        "review_count": 2890,
        "amenities": ["Brunch", "Full Bar", "Historic Building", "Outdoor Seating"],
        "image_url": "https://images.unsplash.com/photo-1529563021893-cc83c992d75d?w=600",
    },
    {
        "name": "State Bird Provisions",
        "cuisine_type": "American",
        "description": "James Beard Best New Restaurant winner in San Francisco. Innovative dim sum-style small plates parade through the dining room. The state bird (quail) with provisions is the signature.",
        "address": "1529 Fillmore St",
        "city": "San Francisco",
        "zip_code": "94115",
        "phone": "+1 415-795-1272",
        "hours": "Mon–Thu: 5:30 PM – 10 PM, Fri–Sat: 5:30 PM – 11 PM",
        "price_tier": "$$$",
        "avg_rating": 4.7,
        "review_count": 2341,
        "amenities": ["Reservations", "Full Bar", "Dim Sum Style Service"],
        "image_url": "https://images.unsplash.com/photo-1559339352-11d035aa65de?w=600",
    },
]

demo_user = {
    "name": "Demo User",
    "email": "user@example.com",
    "password": "password123",
    "role": "user",
    "city": "New York",
    "country": "United States",
}

demo_owner = {
    "name": "Demo Owner",
    "email": "owner@example.com",
    "password": "password123",
    "role": "owner",
    "city": "New York",
    "country": "United States",
}

def seed():
    db = SessionLocal()
    try:
        # Seed restaurants
        existing = db.query(Restaurant).count()
        if existing == 0:
            for r in restaurants:
                db.add(Restaurant(**r))
            db.commit()
            print(f"✓ Added {len(restaurants)} restaurants")
        else:
            print(f"⚠ Restaurants already exist ({existing}), skipping")

        # Seed demo users
        for u in [demo_user, demo_owner]:
            exists = db.query(User).filter(User.email == u["email"]).first()
            if not exists:
                db.add(User(
                    name=u["name"],
                    email=u["email"],
                    password_hash=hash_password(u["password"]),
                    role=u["role"],
                    city=u.get("city", ""),
                    country=u.get("country", ""),
                ))
                print(f"✓ Created user: {u['email']}")
            else:
                print(f"⚠ User {u['email']} already exists, skipping")
        db.commit()
        print("\nSeed complete!")
        print("  Login: user@example.com / password123")
        print("  Owner: owner@example.com / password123")
    finally:
        db.close()

if __name__ == "__main__":
    seed()
