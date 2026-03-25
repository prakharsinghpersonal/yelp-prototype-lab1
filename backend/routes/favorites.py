from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from db.database import get_db
from models.models import User, Restaurant, Favorite
from models.schemas import FavoriteResponse
from services.auth import get_current_user

router = APIRouter(prefix="/favorites", tags=["Favorites"])


@router.get("", response_model=List[FavoriteResponse])
def get_favorites(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Get all favorite restaurants for the logged-in user"""
    favorites = db.query(Favorite).filter(Favorite.user_id == current_user.id).all()
    return favorites


@router.post("/{restaurant_id}", status_code=status.HTTP_201_CREATED)
def add_favorite(
    restaurant_id: int, 
    current_user: User = Depends(get_current_user), 
    db: Session = Depends(get_db)
):
    """Save a restaurant to user's favorites"""
    # Verify restaurant exists
    restaurant = db.query(Restaurant).filter(Restaurant.id == restaurant_id).first()
    if not restaurant:
        raise HTTPException(status_code=404, detail="Restaurant not found")
        
    # Check if already favorited
    existing = db.query(Favorite).filter(
        Favorite.user_id == current_user.id,
        Favorite.restaurant_id == restaurant_id
    ).first()
    
    if existing:
        return {"message": "Already in favorites"}
        
    new_fav = Favorite(user_id=current_user.id, restaurant_id=restaurant_id)
    db.add(new_fav)
    db.commit()
    return {"message": "Added to favorites successfully"}


@router.delete("/{restaurant_id}", status_code=status.HTTP_204_NO_CONTENT)
def remove_favorite(
    restaurant_id: int, 
    current_user: User = Depends(get_current_user), 
    db: Session = Depends(get_db)
):
    """Remove a restaurant from user's favorites"""
    fav = db.query(Favorite).filter(
        Favorite.user_id == current_user.id,
        Favorite.restaurant_id == restaurant_id
    ).first()
    
    if not fav:
        raise HTTPException(status_code=404, detail="Favorite not found")
        
    db.delete(fav)
    db.commit()
    return None
