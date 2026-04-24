from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from pymongo.database import Database

from db.database import DuplicateKeyError, get_db, next_sequence, utcnow
from models.schemas import FavoriteResponse
from services.auth import get_current_user
from services.document_utils import serialize_favorite

router = APIRouter(prefix="/favorites", tags=["Favorites"])


@router.get("", response_model=List[FavoriteResponse])
def get_favorites(current_user: dict = Depends(get_current_user), db: Database = Depends(get_db)):
    favorites = []
    for favorite in db.favorites.find({"user_id": current_user["id"]}).sort("created_at", -1):
        restaurant = db.restaurants.find_one({"id": favorite["restaurant_id"]})
        favorites.append(serialize_favorite(favorite, restaurant))
    return favorites


@router.post("/{restaurant_id}", status_code=status.HTTP_201_CREATED)
def add_favorite(restaurant_id: int, current_user: dict = Depends(get_current_user), db: Database = Depends(get_db)):
    if current_user.get("role") != "user":
        raise HTTPException(status_code=403, detail="Only customers can manage favorites")
    restaurant = db.restaurants.find_one({"id": restaurant_id})
    if not restaurant:
        raise HTTPException(status_code=404, detail="Restaurant not found")

    favorite = {
        "id": next_sequence(db, "favorites"),
        "user_id": current_user["id"],
        "restaurant_id": restaurant_id,
        "created_at": utcnow(),
    }
    try:
        db.favorites.insert_one(favorite)
    except DuplicateKeyError:
        return {"message": "Already in favorites"}
    return {"message": "Added to favorites successfully"}


@router.delete("/{restaurant_id}", status_code=status.HTTP_204_NO_CONTENT)
def remove_favorite(restaurant_id: int, current_user: dict = Depends(get_current_user), db: Database = Depends(get_db)):
    if current_user.get("role") != "user":
        raise HTTPException(status_code=403, detail="Only customers can manage favorites")
    removed = db.favorites.find_one_and_delete({"user_id": current_user["id"], "restaurant_id": restaurant_id})
    if not removed:
        raise HTTPException(status_code=404, detail="Favorite not found")
    return None
