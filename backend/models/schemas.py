from pydantic import BaseModel, EmailStr
from typing import Optional, List


class SignupRequest(BaseModel):
    name: str
    email: EmailStr
    password: str
    phone: Optional[str] = None
    role: Optional[str] = "user"

class OwnerSignupRequest(BaseModel):
    name: str
    email: EmailStr
    password: str
    phone: Optional[str] = None
    restaurant_name: Optional[str] = None
    restaurant_location: Optional[str] = None

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str

class UserResponse(BaseModel):
    id: int
    name: str
    email: EmailStr
    phone: Optional[str] = None
    role: str
    profile_pic_url: Optional[str] = None
    
    class Config:
        from_attributes = True

class UserUpdate(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None
    about_me: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    country: Optional[str] = None
    language: Optional[str] = None
    gender: Optional[str] = None
    profile_pic_url: Optional[str] = None


class RestaurantCreate(BaseModel):
    name: str
    cuisine_type: str
    description: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    zip_code: Optional[str] = None
    phone: Optional[str] = None
    hours: Optional[str] = None
    image_url: Optional[str] = None
    price_tier: Optional[str] = None
    amenities: Optional[List[str]] = None

class RestaurantResponse(BaseModel):
    id: int
    name: str
    cuisine_type: str
    description: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    zip_code: Optional[str] = None
    phone: Optional[str] = None
    hours: Optional[str] = None
    image_url: Optional[str] = None
    price_tier: Optional[str] = None
    amenities: Optional[List[str]] = None
    avg_rating: float = 0.0
    review_count: int = 0
    owner_id: Optional[int] = None

    class Config:
        from_attributes = True

class ReviewCreate(BaseModel):
    rating: int
    comment: Optional[str] = None

class ReviewResponse(BaseModel):
    id: int
    restaurant_id: int
    user_id: int
    rating: int
    comment: Optional[str] = None

    class Config:
        from_attributes = True


class FavoriteResponse(BaseModel):
    id: int
    user_id: int
    restaurant_id: int
    restaurant: RestaurantResponse

    class Config:
        from_attributes = True


class UserPreferenceBase(BaseModel):
    cuisines: Optional[List[str]] = None
    price_range: Optional[str] = None
    location: Optional[str] = None
    preferred_locations: Optional[List[str]] = None
    search_radius: Optional[int] = None
    dietary_needs: Optional[List[str]] = None
    ambiance: Optional[List[str]] = None
    sort_preference: Optional[str] = None

class UserPreferenceUpdate(UserPreferenceBase):
    pass

class UserPreferenceResponse(UserPreferenceBase):
    id: int
    user_id: int

    class Config:
        from_attributes = True


class ChatMessage(BaseModel):
    role: str
    content: str

class AIChatRequest(BaseModel):
    message: str
    conversation_history: List[ChatMessage] = []

class RestaurantBrief(BaseModel):
    id: int
    name: str
    cuisine_type: Optional[str] = None
    city: Optional[str] = None
    avg_rating: Optional[float] = None
    price_tier: Optional[str] = None
    reason: Optional[str] = None

class AIChatResponse(BaseModel):
    response: str
    restaurants: List[RestaurantBrief] = []

