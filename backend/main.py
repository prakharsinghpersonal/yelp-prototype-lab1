import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from dotenv import load_dotenv

load_dotenv()

from routes.auth import router as auth_router
from routes.users import router as users_router
from routes.restaurants import router as restaurants_router
from routes.reviews import router as reviews_router
from routes.favorites import router as favorites_router
from routes.ai_chat import router as ai_chat_router
from routes.history import router as history_router

app = FastAPI(
    title="Yelp Prototype API",
    description="Restaurant discovery and review platform with AI-powered chatbot assistant",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS — allow React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Static files for uploads
UPLOAD_DIR = os.getenv("UPLOAD_DIR", "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)
app.mount("/static", StaticFiles(directory=UPLOAD_DIR), name="static")

# Register routers
app.include_router(auth_router)
app.include_router(users_router)
app.include_router(restaurants_router)
app.include_router(reviews_router)
app.include_router(favorites_router)
app.include_router(ai_chat_router)
app.include_router(history_router)


@app.get("/", tags=["Root"])
def root():
    return {
        "message": "Yelp Prototype API",
        "docs": "/docs",
        "version": "1.0.0",
    }


@app.get("/health", tags=["Root"])
def health_check():
    return {"status": "ok"}
