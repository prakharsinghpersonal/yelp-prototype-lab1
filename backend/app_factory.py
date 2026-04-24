import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from db.database import ensure_indexes
from routes.ai_chat import router as chat_router
from routes.auth import router as auth_router
from routes.favorites import router as favorites_router
from routes.history import router as history_router
from routes.restaurants import router as restaurants_router
from routes.reviews import router as reviews_router
from routes.users import router as users_router

ROUTER_GROUPS = {
    "all": [auth_router, users_router, restaurants_router, reviews_router, favorites_router, chat_router, history_router],
    "user": [auth_router, users_router, favorites_router, history_router, chat_router],
    "owner": [auth_router, restaurants_router],
    "restaurant": [restaurants_router],
    "review": [reviews_router],
}


def create_app(mode: str = "all") -> FastAPI:
    ensure_indexes()
    app = FastAPI(title=f"Yelp Prototype API ({mode})")

    os.makedirs("uploads", exist_ok=True)
    app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

    app.add_middleware(
        CORSMiddleware,
        allow_origins=[
            "http://localhost:3000",
            "http://127.0.0.1:3000",
            "http://localhost:3001",
            "http://127.0.0.1:3001",
            "http://localhost:5173",
            "http://127.0.0.1:5173",
        ],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    for router in ROUTER_GROUPS.get(mode, ROUTER_GROUPS["all"]):
        app.include_router(router)

    @app.get("/")
    def read_root():
        return {"message": f"Hello! The {mode} API is running."}

    return app
