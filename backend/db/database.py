from __future__ import annotations

import os
from datetime import datetime, timezone

from dotenv import load_dotenv
from pymongo import ASCENDING, DESCENDING, MongoClient
from pymongo.collection import Collection
from pymongo.database import Database
from pymongo.errors import DuplicateKeyError
from pymongo import ReturnDocument

load_dotenv()

MONGODB_URI = os.getenv("MONGODB_URI", "mongodb://localhost:27017")
MONGODB_DB_NAME = os.getenv("MONGODB_DB_NAME", "yelp_lab2")

_client = MongoClient(MONGODB_URI)
_db = _client[MONGODB_DB_NAME]


def utcnow() -> datetime:
    return datetime.now(timezone.utc)


def get_database() -> Database:
    return _db


def get_db():
    yield _db


def next_sequence(db: Database, name: str) -> int:
    counter = db.counters.find_one_and_update(
        {"_id": name},
        {"$inc": {"value": 1}},
        upsert=True,
        return_document=ReturnDocument.AFTER,
    )
    return int(counter["value"])


def ensure_indexes(db: Database | None = None) -> None:
    database = db if db is not None else _db
    database.users.create_index([("id", ASCENDING)], unique=True)
    database.users.create_index([("email", ASCENDING)], unique=True)
    database.users.create_index([("role", ASCENDING)])

    database.restaurants.create_index([("id", ASCENDING)], unique=True)
    database.restaurants.create_index([("owner_id", ASCENDING)])
    database.restaurants.create_index([("city", ASCENDING)])
    database.restaurants.create_index([("avg_rating", DESCENDING)])

    database.reviews.create_index([("id", ASCENDING)], unique=True)
    database.reviews.create_index(
        [("restaurant_id", ASCENDING), ("user_id", ASCENDING)],
        unique=True,
    )
    database.reviews.create_index([("restaurant_id", ASCENDING), ("created_at", DESCENDING)])

    database.favorites.create_index([("id", ASCENDING)], unique=True)
    database.favorites.create_index(
        [("user_id", ASCENDING), ("restaurant_id", ASCENDING)],
        unique=True,
    )

    database.user_preferences.create_index([("user_id", ASCENDING)], unique=True)
    database.sessions.create_index([("token", ASCENDING)], unique=True)
    database.sessions.create_index([("expires_at", ASCENDING)], expireAfterSeconds=0)
    database.events.create_index([("event_id", ASCENDING)], unique=True)
    database.events.create_index([("topic", ASCENDING), ("created_at", DESCENDING)])


__all__ = [
    "Collection",
    "Database",
    "DuplicateKeyError",
    "MONGODB_DB_NAME",
    "MONGODB_URI",
    "ensure_indexes",
    "get_database",
    "get_db",
    "next_sequence",
    "utcnow",
]
