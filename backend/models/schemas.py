from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from enum import Enum


# --- Auth Schemas ---
class SignupRequest(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    email: str = Field(..., max_length=255)
    password: str = Field(..., min_length=6)
    role: Optional[str] = "user"
    restaurant_location: Optional[str] = None  # for owner signup


class LoginRequest(BaseModel):
    email: str
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: dict


# --- User Schemas ---
class UserUpdate(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None
    about_me: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    country: Optional[str] = None
    language: Optional[str] = None
    gender: Optional[str] = None


class UserResponse(BaseModel):
    id: int
    name: str
    email: str
    phone: Optional[str] = None
    about_me: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    country: Optional[str] = None
    language: Optional[str] = None
    gender: Optional[str] = None
    profile_pic_url: Optional[str] = None
    role: str

    class Config:
        from_attributes = True


# --- Preferences Schemas ---
class PreferencesUpdate(BaseModel):
    cuisines: Optional[List[str]] = None
    price_range: Optional[str] = None
    location: Optional[str] = None
    search_radius: Optional[int] = None
    dietary_needs: Optional[List[str]] = None
    ambiance: Optional[List[str]] = None
    sort_preference: Optional[str] = "rating"


class PreferencesResponse(BaseModel):
    cuisines: Optional[list] = None
    price_range: Optional[str] = None
    location: Optional[str] = None
    search_radius: Optional[int] = None
    dietary_needs: Optional[list] = None
    ambiance: Optional[list] = None
    sort_preference: Optional[str] = None

    class Config:
        from_attributes = True


# --- Restaurant Schemas ---
class RestaurantCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    cuisine_type: Optional[str] = None
    description: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    zip: Optional[str] = None
    phone: Optional[str] = None
    hours: Optional[str] = None
    price_tier: Optional[str] = "$$"
    amenities: Optional[List[str]] = None


class RestaurantUpdate(BaseModel):
    name: Optional[str] = None
    cuisine_type: Optional[str] = None
    description: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    zip: Optional[str] = None
    phone: Optional[str] = None
    hours: Optional[str] = None
    price_tier: Optional[str] = None
    amenities: Optional[List[str]] = None


class RestaurantResponse(BaseModel):
    id: int
    name: str
    cuisine_type: Optional[str] = None
    description: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    zip: Optional[str] = None
    phone: Optional[str] = None
    hours: Optional[str] = None
    price_tier: Optional[str] = None
    amenities: Optional[list] = None
    avg_rating: Optional[float] = 0.0
    review_count: Optional[int] = 0
    view_count: Optional[int] = 0
    owner_id: Optional[int] = None
    created_by: Optional[int] = None
    photos: Optional[list] = []

    class Config:
        from_attributes = True


# --- Review Schemas ---
class ReviewCreate(BaseModel):
    rating: int = Field(..., ge=1, le=5)
    comment: Optional[str] = None


class ReviewUpdate(BaseModel):
    rating: Optional[int] = Field(None, ge=1, le=5)
    comment: Optional[str] = None


class ReviewResponse(BaseModel):
    id: int
    user_id: int
    restaurant_id: int
    rating: int
    comment: Optional[str] = None
    created_at: Optional[str] = None
    updated_at: Optional[str] = None
    user_name: Optional[str] = None
    user_profile_pic: Optional[str] = None

    class Config:
        from_attributes = True


# --- AI Chat Schemas ---
class ChatRequest(BaseModel):
    message: str
    conversation_history: Optional[List[dict]] = []


class ChatResponse(BaseModel):
    response: str
    recommendations: Optional[List[dict]] = []
