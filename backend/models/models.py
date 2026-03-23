"""SQLAlchemy ORM models for database schema

Models:
  - User: Authentication and profile data
  - Restaurant: Listings with basic info (name, cuisine, city, price tier)
  - Review: User ratings and comments
  - Favorite: User's favorite restaurants
  - UserPreference: User's search preferences
"""
from sqlalchemy import Column, Integer, String, Text, Enum, TIMESTAMP, ForeignKey, Float, JSON
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from db.database import Base


class User(Base):
    """User model for authentication and profile management"""
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, autoincrement=True)
    
    name = Column(String(100), nullable=False)
    email = Column(String(255), nullable=False, unique=True)
    password_hash = Column(String(255), nullable=False)
    phone = Column(String(20))
    about_me = Column(Text)
    city = Column(String(100))
    state = Column(String(10))
    country = Column(String(100))
    language = Column(String(100))
    gender = Column(Enum("male", "female", "other", "prefer_not_to_say"))
    profile_pic_url = Column(String(500))
    role = Column(Enum("user", "owner"), default="user")
    created_at = Column(TIMESTAMP, server_default=func.now())
    updated_at = Column(TIMESTAMP, server_default=func.now(), onupdate=func.now())
    
    # Relationships
    owned_restaurants = relationship("Restaurant", back_populates="owner")
    reviews = relationship("Review", back_populates="user")
    favorites = relationship("Favorite", back_populates="user")
    preference = relationship("UserPreference", back_populates="user", uselist=False, cascade="all, delete-orphan")


class Restaurant(Base):
    """Restaurant listing model"""
    __tablename__ = "restaurants"

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(255), nullable=False)
    cuisine_type = Column(String(100), nullable=False)
    description = Column(Text)
    address = Column(String(255))
    city = Column(String(100))
    state = Column(String(10))
    zip_code = Column(String(20))
    phone = Column(String(20))
    hours = Column(String(255))
    price_tier = Column(Enum('$', '$$', '$$$', '$$$$'))
    amenities = Column(JSON)
    avg_rating = Column(Float, default=0.0)
    review_count = Column(Integer, default=0)
    view_count = Column(Integer, default=0)
    owner_id = Column(Integer, ForeignKey("users.id"))
    created_at = Column(TIMESTAMP, server_default=func.now())
    updated_at = Column(TIMESTAMP, server_default=func.now(), onupdate=func.now())
    
    # Relationships
    owner = relationship("User", back_populates="owned_restaurants")
    reviews = relationship("Review", back_populates="restaurant", cascade="all, delete-orphan")
    favorited_by = relationship("Favorite", back_populates="restaurant", cascade="all, delete-orphan")


class Review(Base):
    """Review model for restaurant ratings and comments"""
    __tablename__ = "reviews"

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    restaurant_id = Column(Integer, ForeignKey("restaurants.id", ondelete="CASCADE"), nullable=False)
    rating = Column(Integer, nullable=False)
    comment = Column(Text)
    created_at = Column(TIMESTAMP, server_default=func.now())
    updated_at = Column(TIMESTAMP, server_default=func.now(), onupdate=func.now())
    
    # Relationships
    user = relationship("User", back_populates="reviews")
    restaurant = relationship("Restaurant", back_populates="reviews")


class Favorite(Base):
    """User favorite restaurants model"""
    __tablename__ = "favorites"

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    restaurant_id = Column(Integer, ForeignKey("restaurants.id", ondelete="CASCADE"), nullable=False)
    created_at = Column(TIMESTAMP, server_default=func.now())
    
    # Relationships
    user = relationship("User", back_populates="favorites")
    restaurant = relationship("Restaurant", back_populates="favorited_by")


class UserPreference(Base):
    """User preferences for AI assistant recommendations"""
    __tablename__ = "user_preferences"

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    cuisines = Column(JSON)
    price_range = Column(String(10))
    location = Column(String(255))
    preferred_locations = Column(JSON)
    search_radius = Column(Integer)
    dietary_needs = Column(JSON)
    ambiance = Column(JSON)
    sort_preference = Column(String(50))
    created_at = Column(TIMESTAMP, server_default=func.now())
    updated_at = Column(TIMESTAMP, server_default=func.now(), onupdate=func.now())
    
    # 1-to-1 Relationship
    user = relationship("User", back_populates="preference")
