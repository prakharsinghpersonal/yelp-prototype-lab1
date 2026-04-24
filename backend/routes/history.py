from fastapi import APIRouter, Depends
from pymongo.database import Database

from db.database import get_db
from services.auth import get_current_user

router = APIRouter(prefix="/users", tags=["Users"])


@router.get("/me/history")
def get_my_history(current_user: dict = Depends(get_current_user), db: Database = Depends(get_db)):
    reviews = list(db.reviews.find({"user_id": current_user["id"]}).sort("created_at", -1))
    restaurants = list(db.restaurants.find({"owner_id": current_user["id"]}).sort("created_at", -1))

    restaurant_map = {restaurant["id"]: restaurant for restaurant in db.restaurants.find({"id": {"$in": [review["restaurant_id"] for review in reviews]}})}

    return {
        "reviews": [
            {
                "id": review["id"],
                "restaurant_id": review["restaurant_id"],
                "restaurant_name": restaurant_map.get(review["restaurant_id"], {}).get("name", "Unknown"),
                "rating": review["rating"],
                "comment": review.get("comment"),
                "created_at": str(review.get("created_at")) if review.get("created_at") else None,
            }
            for review in reviews
        ],
        "restaurants_added": [
            {
                "id": restaurant["id"],
                "name": restaurant["name"],
                "cuisine_type": restaurant["cuisine_type"],
                "city": restaurant.get("city"),
                "created_at": str(restaurant.get("created_at")) if restaurant.get("created_at") else None,
            }
            for restaurant in restaurants
        ],
    }
