"""FastAPI main application entry point - Yelp Prototype Backend

Routes:
  - /auth: Authentication (signup, login)
  - /users: User profile and preferences
  - /restaurants: Restaurant CRUD and search (with pagination)
  - /reviews: Review management
  - /favorites: Favorites/wishlist management (with pagination)
  - /ai-assistant: AI chatbot recommendations
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from db.database import engine, Base
from models import models
from routes.auth import router as auth_router
from routes.users import router as users_router
from routes.restaurants import router as restaurants_router
from routes.reviews import router as reviews_router
from routes.favorites import router as favorites_router
from routes.ai_chat import router as chat_router
from routes.history import router as history_router

# Initialize database schema
Base.metadata.create_all(bind=engine)

# Create FastAPI app
app = FastAPI(
    title="Yelp Prototype API",
    description="Restaurant discovery platform with reviews, ratings, favorites, and AI recommendations",
    version="1.0.0"
)

# --- CORS MIDDLEWARE ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(users_router)
app.include_router(restaurants_router)
app.include_router(reviews_router)
app.include_router(favorites_router)
app.include_router(chat_router)
app.include_router(history_router)

# A simple root route to test if the server is running
@app.get("/")
def read_root():
    return {"message": "Hello! The API is running."}
