from __future__ import annotations

import os
import re
import shutil
import uuid
from typing import Optional

from fastapi import APIRouter, Depends, File, HTTPException, Query, UploadFile, status
from pymongo.database import Database

from db.database import get_db, utcnow
from models.schemas import RestaurantCreate, RestaurantResponse
from services.auth import get_current_user
from services.document_utils import serialize_restaurant
from services.event_bus import publish_event

router = APIRouter(prefix="/restaurants", tags=["Restaurants"])


def _get_restaurant_or_404(db: Database, restaurant_id: int) -> dict:
    restaurant = db.restaurants.find_one({"id": restaurant_id})
    if not restaurant:
        raise HTTPException(status_code=404, detail="Restaurant not found")
    return restaurant


@router.get("", response_model=list[RestaurantResponse])
def list_restaurants(
    search: Optional[str] = Query(None, description="Search by name"),
    keywords: Optional[str] = Query(None, description="Search by keywords like quiet/outdoor seating/wifi"),
    cuisine: Optional[str] = Query(None, description="Filter by cuisine type"),
    city: Optional[str] = Query(None, description="Filter by city"),
    zip_code: Optional[str] = Query(None, description="Filter by ZIP code"),
    price_tier: Optional[str] = Query(None, description="Filter by price tier"),
    db: Database = Depends(get_db),
):
    filters = {}
    clauses = []
    combined_search = " ".join(part for part in [search, keywords] if part).strip()
    if combined_search:
        for token in [part for part in re.split(r"\s+", combined_search) if part]:
            pattern = {"$regex": re.escape(token), "$options": "i"}
            clauses.append(
                {
                    "$or": [
                        {"name": pattern},
                        {"cuisine_type": pattern},
                        {"description": pattern},
                        {"address": pattern},
                        {"city": pattern},
                        {"zip_code": pattern},
                        {"amenities": pattern},
                        {"hours": pattern},
                    ]
                }
            )
    if cuisine:
        clauses.append({"cuisine_type": {"$regex": re.escape(cuisine), "$options": "i"}})
    if city:
        clauses.append({"city": {"$regex": re.escape(city), "$options": "i"}})
    if zip_code:
        clauses.append({"zip_code": {"$regex": f"^{re.escape(zip_code)}", "$options": "i"}})
    if price_tier:
        clauses.append({"price_tier": price_tier})
    if clauses:
        filters = {"$and": clauses}
    restaurants = db.restaurants.find(filters).sort([("avg_rating", -1), ("review_count", -1), ("name", 1)])
    return [serialize_restaurant(restaurant) for restaurant in restaurants]


@router.get("/owner/dashboard")
def owner_dashboard(current_user: dict = Depends(get_current_user), db: Database = Depends(get_db)):
    if current_user.get("role") != "owner":
        raise HTTPException(status_code=403, detail="Owner access required")

    owned = [serialize_restaurant(restaurant) for restaurant in db.restaurants.find({"owner_id": current_user["id"]}).sort("id", 1)]
    if not owned:
        return {"restaurant": None, "analytics": None, "recent_reviews": [], "all_restaurants": []}

    primary = owned[0]
    owned_ids = [restaurant["id"] for restaurant in owned]
    reviews = list(db.reviews.find({"restaurant_id": {"$in": owned_ids}}).sort("created_at", -1))
    total_favorites = db.favorites.count_documents({"restaurant_id": {"$in": owned_ids}})
    users = {
        user["id"]: user
        for user in db.users.find({"id": {"$in": [review["user_id"] for review in reviews]}})
    }
    restaurants_by_id = {restaurant["id"]: restaurant for restaurant in owned}

    rating_distribution = {score: 0 for score in range(1, 6)}
    for review in reviews:
        if review["rating"] in rating_distribution:
            rating_distribution[review["rating"]] += 1

    total_views = sum(restaurant.get("view_count", 0) for restaurant in owned)
    average_rating = round(sum(review["rating"] for review in reviews) / len(reviews), 1) if reviews else 0.0

    return {
        "restaurant": {
            "id": primary["id"],
            "name": primary["name"],
            "cuisine_type": primary["cuisine_type"],
            "city": primary.get("city"),
            "image_url": primary.get("image_url"),
            "price_tier": primary.get("price_tier"),
        },
        "analytics": {
            "restaurant_count": len(owned),
            "total_views": total_views,
            "avg_rating": average_rating,
            "total_reviews": len(reviews),
            "total_favorites": total_favorites,
            "rating_distribution": rating_distribution,
        },
        "recent_reviews": [
            {
                "id": review["id"],
                "restaurant_id": review["restaurant_id"],
                "restaurant_name": restaurants_by_id.get(review["restaurant_id"], {}).get("name", "Unknown"),
                "rating": review["rating"],
                "comment": review.get("comment"),
                "user_name": users.get(review["user_id"], {}).get("name", "Anonymous"),
                "created_at": str(review.get("created_at")) if review.get("created_at") else None,
            }
            for review in reviews[:5]
        ],
        "all_restaurants": [
            {"id": restaurant["id"], "name": restaurant["name"], "avg_rating": restaurant["avg_rating"], "review_count": restaurant["review_count"]}
            for restaurant in owned
        ],
    }


@router.get("/owner/restaurant")
def get_owner_restaurant(current_user: dict = Depends(get_current_user), db: Database = Depends(get_db)):
    if current_user.get("role") != "owner":
        raise HTTPException(status_code=403, detail="Owner access required")

    restaurant = db.restaurants.find_one({"owner_id": current_user["id"]})
    if not restaurant:
        raise HTTPException(status_code=404, detail="No restaurant found. Please add or claim one first.")
    return serialize_restaurant(restaurant)


@router.get("/owner/reviews")
def get_owner_reviews(current_user: dict = Depends(get_current_user), db: Database = Depends(get_db)):
    if current_user.get("role") != "owner":
        raise HTTPException(status_code=403, detail="Owner access required")

    owned = [restaurant["id"] for restaurant in db.restaurants.find({"owner_id": current_user["id"]}, {"id": 1})]
    if not owned:
        return []

    reviews = list(db.reviews.find({"restaurant_id": {"$in": owned}}).sort("created_at", -1))
    restaurants = {
        restaurant["id"]: restaurant
        for restaurant in db.restaurants.find({"id": {"$in": owned}})
    }
    users = {
        user["id"]: user
        for user in db.users.find({"id": {"$in": [review["user_id"] for review in reviews]}})
    }
    return [
        {
            "id": review["id"],
            "restaurant_id": review["restaurant_id"],
            "restaurant_name": restaurants.get(review["restaurant_id"], {}).get("name", "Unknown"),
            "rating": review["rating"],
            "comment": review.get("comment"),
            "user_name": users.get(review["user_id"], {}).get("name", "Anonymous"),
            "created_at": str(review.get("created_at")) if review.get("created_at") else None,
        }
        for review in reviews
    ]


@router.post("/{restaurant_id}/photos")
def upload_restaurant_photo(
    restaurant_id: int,
    file: UploadFile = File(...),
    current_user: dict = Depends(get_current_user),
    db: Database = Depends(get_db),
):
    restaurant = _get_restaurant_or_404(db, restaurant_id)
    if restaurant.get("owner_id") != current_user["id"]:
        raise HTTPException(status_code=403, detail="Only the restaurant owner can upload photos")
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image")

    upload_dir = os.path.join("uploads", "restaurants")
    os.makedirs(upload_dir, exist_ok=True)

    ext = file.filename.split(".")[-1] if "." in file.filename else "jpg"
    filename = f"restaurant_{restaurant_id}_{uuid.uuid4().hex}.{ext}"
    file_path = os.path.join(upload_dir, filename)
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    url = f"/uploads/restaurants/{filename}"
    db.restaurants.update_one(
        {"id": restaurant_id},
        {
            "$set": {"image_url": url, "updated_at": utcnow()},
            "$push": {"photos": {"url": url, "uploaded_at": utcnow(), "uploaded_by": current_user["id"]}},
        },
    )
    return {"url": url, "image_url": url}


@router.post("/{restaurant_id}/claim", status_code=status.HTTP_200_OK)
def claim_restaurant(restaurant_id: int, current_user: dict = Depends(get_current_user), db: Database = Depends(get_db)):
    if current_user.get("role") != "owner":
        raise HTTPException(status_code=403, detail="Only owners can claim restaurants")
    restaurant = _get_restaurant_or_404(db, restaurant_id)
    if restaurant.get("owner_id") is not None and restaurant.get("owner_id") != current_user["id"]:
        raise HTTPException(status_code=400, detail="Restaurant already claimed by another owner")
    return publish_event(db, "restaurant.claimed", {"restaurant_id": restaurant_id, "owner_id": current_user["id"]})


@router.get("/{restaurant_id}", response_model=RestaurantResponse)
def get_restaurant(restaurant_id: int, db: Database = Depends(get_db)):
    restaurant = _get_restaurant_or_404(db, restaurant_id)
    db.restaurants.update_one({"id": restaurant_id}, {"$inc": {"view_count": 1}, "$set": {"updated_at": utcnow()}})
    return serialize_restaurant(db.restaurants.find_one({"id": restaurant_id}))


@router.post("", response_model=RestaurantResponse, status_code=status.HTTP_201_CREATED)
def create_restaurant(req: RestaurantCreate, current_user: dict = Depends(get_current_user), db: Database = Depends(get_db)):
    if current_user.get("role") != "owner":
        raise HTTPException(status_code=403, detail="Only owners can create restaurants")
    payload = req.model_dump()
    payload["owner_id"] = current_user["id"]
    return publish_event(db, "restaurant.created", payload)


@router.put("/{restaurant_id}", response_model=RestaurantResponse)
def update_restaurant(
    restaurant_id: int,
    req: RestaurantCreate,
    current_user: dict = Depends(get_current_user),
    db: Database = Depends(get_db),
):
    if current_user.get("role") != "owner":
        raise HTTPException(status_code=403, detail="Only owners can update restaurants")
    restaurant = _get_restaurant_or_404(db, restaurant_id)
    if restaurant.get("owner_id") != current_user["id"]:
        raise HTTPException(status_code=403, detail="Only the restaurant owner can update this listing")

    return publish_event(
        db,
        "restaurant.updated",
        {
            "restaurant_id": restaurant_id,
            "actor_id": current_user["id"],
            "updates": req.model_dump(exclude_unset=True),
        },
    )


@router.delete("/{restaurant_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_restaurant(restaurant_id: int, current_user: dict = Depends(get_current_user), db: Database = Depends(get_db)):
    if current_user.get("role") != "owner":
        raise HTTPException(status_code=403, detail="Only owners can delete restaurants")
    restaurant = _get_restaurant_or_404(db, restaurant_id)
    if restaurant.get("owner_id") != current_user["id"]:
        raise HTTPException(status_code=403, detail="Only the restaurant owner can delete this listing")
    publish_event(db, "restaurant.deleted", {"restaurant_id": restaurant_id, "actor_id": current_user["id"]})
    return None
