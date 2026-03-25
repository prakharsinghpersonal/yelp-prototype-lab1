"""Review routes - User reviews, ratings, and comment management"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List

from db.database import get_db
from models.models import User, Restaurant, Review
from models.schemas import ReviewCreate, ReviewResponse
from services.auth import get_current_user

# Router for /restaurants/{id}/reviews endpoints
router = APIRouter(tags=["Reviews"])


def _recalculate_rating(db: Session, restaurant_id: int):
    """Recalculate avg_rating and review_count for a restaurant from all its reviews"""
    result = db.query(
        func.count(Review.id),
        func.coalesce(func.avg(Review.rating), 0)
    ).filter(Review.restaurant_id == restaurant_id).first()

    restaurant = db.query(Restaurant).filter(Restaurant.id == restaurant_id).first()
    if restaurant:
        restaurant.review_count = result[0]
        restaurant.avg_rating = round(float(result[1]), 1)


# --- GET REVIEWS FOR A RESTAURANT (Public) ---
@router.get("/restaurants/{restaurant_id}/reviews", response_model=List[ReviewResponse])
def get_restaurant_reviews(restaurant_id: int, db: Session = Depends(get_db)):
    """Fetch all reviews for a specific restaurant"""
    return db.query(Review).filter(Review.restaurant_id == restaurant_id).all()


# --- CREATE A REVIEW (Protected) ---
@router.post("/restaurants/{restaurant_id}/reviews", response_model=ReviewResponse, status_code=status.HTTP_201_CREATED)
def create_review(
    restaurant_id: int,
    req: ReviewCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Leave a review for a restaurant"""
    restaurant = db.query(Restaurant).filter(Restaurant.id == restaurant_id).first()
    if not restaurant:
        raise HTTPException(status_code=404, detail="Restaurant not found")

    existing = db.query(Review).filter(
        Review.restaurant_id == restaurant_id,
        Review.user_id == current_user.id
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="You already reviewed this restaurant")

    new_review = Review(
        user_id=current_user.id,
        restaurant_id=restaurant_id,
        rating=req.rating,
        comment=req.comment
    )
    db.add(new_review)
    _recalculate_rating(db, restaurant_id)

    db.commit()
    db.refresh(new_review)
    return new_review


# --- UPDATE OWN REVIEW (Protected) ---
@router.put("/reviews/{review_id}", response_model=ReviewResponse)
def update_review(
    review_id: int,
    req: ReviewCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update your own review — returns 403 if not the author"""
    review = db.query(Review).filter(Review.id == review_id).first()
    if not review:
        raise HTTPException(status_code=404, detail="Review not found")
    if review.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="You can only edit your own reviews")

    review.rating = req.rating
    review.comment = req.comment
    _recalculate_rating(db, review.restaurant_id)

    db.commit()
    db.refresh(review)
    return review


# --- DELETE OWN REVIEW (Protected) ---
@router.delete("/reviews/{review_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_review(
    review_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete your own review — returns 403 if not the author"""
    review = db.query(Review).filter(Review.id == review_id).first()
    if not review:
        raise HTTPException(status_code=404, detail="Review not found")
    if review.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="You can only delete your own reviews")

    restaurant_id = review.restaurant_id
    db.delete(review)
    _recalculate_rating(db, restaurant_id)

    db.commit()
    return None
