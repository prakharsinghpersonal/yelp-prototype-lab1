from __future__ import annotations

from pymongo.database import Database

from db.database import next_sequence, utcnow
from services.document_utils import serialize_restaurant, serialize_review


def _recalculate_rating(db: Database, restaurant_id: int) -> None:
    reviews = list(db.reviews.find({"restaurant_id": restaurant_id}))
    review_count = len(reviews)
    avg_rating = round(sum(review["rating"] for review in reviews) / review_count, 1) if review_count else 0.0
    db.restaurants.update_one(
        {"id": restaurant_id},
        {"$set": {"review_count": review_count, "avg_rating": avg_rating, "updated_at": utcnow()}},
    )


def _append_activity(db: Database, restaurant_id: int, action: str, actor_id: int | None, details: dict | None = None) -> None:
    db.restaurants.update_one(
        {"id": restaurant_id},
        {
            "$push": {
                "activity_logs": {
                    "action": action,
                    "actor_id": actor_id,
                    "details": details or {},
                    "created_at": utcnow(),
                }
            }
        },
    )


def handle_restaurant_created(db: Database, payload: dict) -> dict:
    restaurant_id = next_sequence(db, "restaurants")
    now = utcnow()
    restaurant = {
        "id": restaurant_id,
        "name": payload["name"],
        "cuisine_type": payload["cuisine_type"],
        "description": payload.get("description"),
        "address": payload.get("address"),
        "city": payload.get("city"),
        "state": payload.get("state"),
        "country": payload.get("country"),
        "zip_code": payload.get("zip_code"),
        "phone": payload.get("phone"),
        "hours": payload.get("hours"),
        "image_url": payload.get("image_url"),
        "price_tier": payload.get("price_tier"),
        "amenities": payload.get("amenities") or [],
        "avg_rating": 0.0,
        "review_count": 0,
        "view_count": 0,
        "owner_id": payload.get("owner_id"),
        "photos": payload.get("photos") or [],
        "activity_logs": [],
        "created_at": now,
        "updated_at": now,
    }
    db.restaurants.insert_one(restaurant)
    _append_activity(db, restaurant_id, "restaurant.created", payload.get("owner_id"), {"name": restaurant["name"]})
    return serialize_restaurant(restaurant)


def handle_restaurant_updated(db: Database, payload: dict) -> dict:
    updates = payload["updates"]
    updates["updated_at"] = utcnow()
    db.restaurants.update_one({"id": payload["restaurant_id"]}, {"$set": updates})
    _append_activity(db, payload["restaurant_id"], "restaurant.updated", payload.get("actor_id"), {"fields": sorted(updates.keys())})
    return serialize_restaurant(db.restaurants.find_one({"id": payload["restaurant_id"]}))


def handle_restaurant_deleted(db: Database, payload: dict) -> dict:
    restaurant_id = payload["restaurant_id"]
    db.reviews.delete_many({"restaurant_id": restaurant_id})
    db.favorites.delete_many({"restaurant_id": restaurant_id})
    deleted = db.restaurants.find_one_and_delete({"id": restaurant_id})
    return {"deleted": bool(deleted), "restaurant_id": restaurant_id}


def handle_restaurant_claimed(db: Database, payload: dict) -> dict:
    db.restaurants.update_one(
        {"id": payload["restaurant_id"]},
        {"$set": {"owner_id": payload["owner_id"], "updated_at": utcnow()}},
    )
    _append_activity(db, payload["restaurant_id"], "restaurant.claimed", payload["owner_id"])
    return {"message": "Restaurant claimed successfully", "restaurant_id": payload["restaurant_id"]}


def handle_review_created(db: Database, payload: dict) -> dict:
    review_id = next_sequence(db, "reviews")
    now = utcnow()
    review = {
        "id": review_id,
        "restaurant_id": payload["restaurant_id"],
        "user_id": payload["user_id"],
        "rating": payload["rating"],
        "comment": payload.get("comment"),
        "status": "processed",
        "created_at": now,
        "updated_at": now,
    }
    db.reviews.insert_one(review)
    _recalculate_rating(db, payload["restaurant_id"])
    _append_activity(db, payload["restaurant_id"], "review.created", payload["user_id"], {"review_id": review_id})
    return serialize_review(review)


def handle_review_updated(db: Database, payload: dict) -> dict:
    db.reviews.update_one(
        {"id": payload["review_id"]},
        {
            "$set": {
                "rating": payload["rating"],
                "comment": payload.get("comment"),
                "updated_at": utcnow(),
                "status": "processed",
            }
        },
    )
    review = db.reviews.find_one({"id": payload["review_id"]})
    if review:
        _recalculate_rating(db, review["restaurant_id"])
        _append_activity(db, review["restaurant_id"], "review.updated", review["user_id"], {"review_id": review["id"]})
    return serialize_review(review)


def handle_review_deleted(db: Database, payload: dict) -> dict:
    review = db.reviews.find_one_and_delete({"id": payload["review_id"]})
    if review:
        _recalculate_rating(db, review["restaurant_id"])
        _append_activity(db, review["restaurant_id"], "review.deleted", review["user_id"], {"review_id": review["id"]})
    return {"deleted": bool(review), "review_id": payload["review_id"]}


TOPIC_HANDLERS = {
    "restaurant.created": handle_restaurant_created,
    "restaurant.updated": handle_restaurant_updated,
    "restaurant.deleted": handle_restaurant_deleted,
    "restaurant.claimed": handle_restaurant_claimed,
    "review.created": handle_review_created,
    "review.updated": handle_review_updated,
    "review.deleted": handle_review_deleted,
}


def process_event(db: Database, topic: str, payload: dict) -> dict:
    handler = TOPIC_HANDLERS.get(topic)
    if not handler:
        raise ValueError(f"No handler registered for topic {topic}")
    return handler(db, payload)
