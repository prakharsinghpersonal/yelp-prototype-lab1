from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from db.database import get_db
from models.models import User, Favorite, Restaurant
from services.auth import get_current_user

router = APIRouter(prefix="/favorites", tags=["Favorites"])


@router.get("/")
def list_favorites(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """List all favorite restaurants for the current user."""
    favorites = (
        db.query(Favorite, Restaurant)
        .join(Restaurant, Favorite.restaurant_id == Restaurant.id)
        .filter(Favorite.user_id == current_user.id)
        .order_by(Favorite.created_at.desc())
        .all()
    )
    return [
        {
            "id": fav.id,
            "restaurant": {
                "id": rest.id,
                "name": rest.name,
                "cuisine_type": rest.cuisine_type,
                "city": rest.city,
                "avg_rating": float(rest.avg_rating) if rest.avg_rating else 0.0,
                "price_tier": rest.price_tier,
                "review_count": rest.review_count,
            },
            "created_at": str(fav.created_at),
        }
        for fav, rest in favorites
    ]


@router.post("/{restaurant_id}", status_code=status.HTTP_201_CREATED)
def add_favorite(
    restaurant_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Add a restaurant to favorites."""
    restaurant = db.query(Restaurant).filter(Restaurant.id == restaurant_id).first()
    if not restaurant:
        raise HTTPException(status_code=404, detail="Restaurant not found")

    existing = db.query(Favorite).filter(
        Favorite.user_id == current_user.id,
        Favorite.restaurant_id == restaurant_id,
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="Already in favorites")

    fav = Favorite(user_id=current_user.id, restaurant_id=restaurant_id)
    db.add(fav)
    db.commit()
    return {"message": "Added to favorites"}


@router.delete("/{restaurant_id}", status_code=status.HTTP_204_NO_CONTENT)
def remove_favorite(
    restaurant_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Remove a restaurant from favorites."""
    fav = db.query(Favorite).filter(
        Favorite.user_id == current_user.id,
        Favorite.restaurant_id == restaurant_id,
    ).first()
    if not fav:
        raise HTTPException(status_code=404, detail="Not in favorites")
    db.delete(fav)
    db.commit()
