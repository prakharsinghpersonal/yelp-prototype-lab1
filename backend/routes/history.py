"""History routes - User activity history (reviews written + restaurants added)"""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from db.database import get_db
from models.models import User, Restaurant, Review
from services.auth import get_current_user

router = APIRouter(prefix="/users", tags=["Users"])


@router.get("/me/history")
def get_my_history(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Return the current user's activity history: reviews written and restaurants added"""
    reviews = db.query(Review).filter(Review.user_id == current_user.id).all()
    restaurants = db.query(Restaurant).filter(Restaurant.owner_id == current_user.id).all()

    return {
        "reviews": [
            {
                "id": r.id,
                "restaurant_id": r.restaurant_id,
                "restaurant_name": r.restaurant.name if r.restaurant else "Unknown",
                "rating": r.rating,
                "comment": r.comment,
                "created_at": str(r.created_at) if r.created_at else None,
            }
            for r in reviews
        ],
        "restaurants_added": [
            {
                "id": rest.id,
                "name": rest.name,
                "cuisine_type": rest.cuisine_type,
                "city": rest.city,
                "created_at": str(rest.created_at) if rest.created_at else None,
            }
            for rest in restaurants
        ],
    }
