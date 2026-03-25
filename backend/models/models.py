from sqlalchemy import (
    Column, Integer, String, Text, Enum, DECIMAL, JSON,
    ForeignKey, TIMESTAMP, UniqueConstraint, CheckConstraint
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from db.database import Base


class User(Base):
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
    preferences = relationship("UserPreference", back_populates="user", uselist=False, cascade="all, delete-orphan")
    reviews = relationship("Review", back_populates="user", cascade="all, delete-orphan")
    favorites = relationship("Favorite", back_populates="user", cascade="all, delete-orphan")
    owned_restaurants = relationship("Restaurant", back_populates="owner", foreign_keys="Restaurant.owner_id")
    created_restaurants = relationship("Restaurant", foreign_keys="Restaurant.created_by", overlaps="creator")


class UserPreference(Base):
    __tablename__ = "user_preferences"

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, unique=True)
    cuisines = Column(JSON)
    price_range = Column(String(10))
    location = Column(String(255))
    preferred_locations = Column(JSON)
    search_radius = Column(Integer)
    dietary_needs = Column(JSON)
    ambiance = Column(JSON)
    sort_preference = Column(Enum("rating", "distance", "popularity", "price"), default="rating")
    created_at = Column(TIMESTAMP, server_default=func.now())
    updated_at = Column(TIMESTAMP, server_default=func.now(), onupdate=func.now())

    user = relationship("User", back_populates="preferences")


class Restaurant(Base):
    __tablename__ = "restaurants"

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(255), nullable=False)
    cuisine_type = Column(String(100))
    description = Column(Text)
    address = Column(String(500))
    city = Column(String(100))
    zip = Column(String(20))
    phone = Column(String(20))
    hours = Column(String(500))
    price_tier = Column(Enum("$", "$$", "$$$", "$$$$"), default="$$")
    amenities = Column(JSON)
    owner_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"))
    created_by = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"))
    avg_rating = Column(DECIMAL(3, 2), default=0.00)
    review_count = Column(Integer, default=0)
    view_count = Column(Integer, default=0)
    created_at = Column(TIMESTAMP, server_default=func.now())
    updated_at = Column(TIMESTAMP, server_default=func.now(), onupdate=func.now())

    owner = relationship("User", back_populates="owned_restaurants", foreign_keys=[owner_id])
    creator = relationship("User", foreign_keys=[created_by])
    reviews = relationship("Review", back_populates="restaurant", cascade="all, delete-orphan")
    photos = relationship("Photo", back_populates="restaurant", cascade="all, delete-orphan")
    favorited_by = relationship("Favorite", back_populates="restaurant", cascade="all, delete-orphan")


class Review(Base):
    __tablename__ = "reviews"

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    restaurant_id = Column(Integer, ForeignKey("restaurants.id", ondelete="CASCADE"), nullable=False)
    rating = Column(Integer, nullable=False)
    comment = Column(Text)
    created_at = Column(TIMESTAMP, server_default=func.now())
    updated_at = Column(TIMESTAMP, server_default=func.now(), onupdate=func.now())

    user = relationship("User", back_populates="reviews")
    restaurant = relationship("Restaurant", back_populates="reviews")
    photos = relationship("Photo", back_populates="review", cascade="all, delete-orphan")


class Photo(Base):
    __tablename__ = "photos"

    id = Column(Integer, primary_key=True, autoincrement=True)
    restaurant_id = Column(Integer, ForeignKey("restaurants.id", ondelete="CASCADE"))
    review_id = Column(Integer, ForeignKey("reviews.id", ondelete="SET NULL"))
    url = Column(String(500), nullable=False)
    created_at = Column(TIMESTAMP, server_default=func.now())

    restaurant = relationship("Restaurant", back_populates="photos")
    review = relationship("Review", back_populates="photos")


class Favorite(Base):
    __tablename__ = "favorites"

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    restaurant_id = Column(Integer, ForeignKey("restaurants.id", ondelete="CASCADE"), nullable=False)
    created_at = Column(TIMESTAMP, server_default=func.now())

    __table_args__ = (
        UniqueConstraint("user_id", "restaurant_id", name="unique_favorite"),
    )

    user = relationship("User", back_populates="favorites")
    restaurant = relationship("Restaurant", back_populates="favorited_by")
