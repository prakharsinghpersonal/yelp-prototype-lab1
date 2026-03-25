"""User activity history route."""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from db.database import get_db
from models.models import User, Review, Restaurant
from services.auth import get_current_user

router = APIRouter(tags=["History"])


@router.get("/users/me/history")
def get_user_history(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Returns the user's activity history:
    - Reviews they've written (with restaurant info)
    - Restaurants they've added
    """
    # Reviews written
    reviews = (
        db.query(Review, Restaurant.name.label("restaurant_name"))
        .join(Restaurant, Review.restaurant_id == Restaurant.id)
        .filter(Review.user_id == current_user.id)
        .order_by(Review.created_at.desc())
        .all()
    )
    review_history = [
        {
            "type": "review",
            "review_id": r.id,
            "restaurant_id": r.restaurant_id,
            "restaurant_name": name,
            "rating": r.rating,
            "comment": r.comment,
            "date": str(r.created_at),
        }
        for r, name in reviews
    ]

    # Restaurants added
    restaurants = (
        db.query(Restaurant)
        .filter(Restaurant.created_by == current_user.id)
        .order_by(Restaurant.created_at.desc())
        .all()
    )
    restaurant_history = [
        {
            "type": "restaurant_added",
            "restaurant_id": r.id,
            "restaurant_name": r.name,
            "cuisine_type": r.cuisine_type,
            "city": r.city,
            "date": str(r.created_at),
        }
        for r in restaurants
    ]

    # Merge and sort by date descending
    combined = review_history + restaurant_history
    combined.sort(key=lambda x: x["date"], reverse=True)

    return {"history": combined}
