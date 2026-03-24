from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os
from db.database import engine, Base

# Import the models so SQLAlchemy knows about them
from models import models

# Import our new auth router!
from routes.auth import router as auth_router
from routes.users import router as users_router
from routes.restaurants import router as restaurants_router
from routes.reviews import router as reviews_router
from routes.favorites import router as favorites_router
from routes.ai_chat import router as chat_router

# This single line looks at all classes inheriting from Base (`User` model we just made),
# and automatically creates the corresponding tables in MySQL if they don't exist!
Base.metadata.create_all(bind=engine)

# Create the FastAPI app instance
app = FastAPI(title="Yelp Prototype API")

# Mount the static files directory to serve uploads
os.makedirs("uploads", exist_ok=True)
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

# --- CORS MIDDLEWARE ---
# Allows the React frontend (port 3000 or 3001) to talk to this backend (port 8000)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:3001",
        "http://127.0.0.1:3001",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Tell FastAPI to include all the endpoints defined in our auth.py file.
# They will all automatically be prefixed with "/auth" because we set that in the router.
app.include_router(auth_router)
app.include_router(users_router)
app.include_router(restaurants_router)
app.include_router(reviews_router)
app.include_router(favorites_router)
app.include_router(chat_router)

# A simple root route to test if the server is running
@app.get("/")
def read_root():
    return {"message": "Hello! The API is running."}
