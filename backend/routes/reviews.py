from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func

from db.database import get_db
from models.models import User, Review, Restaurant
from models.schemas import ReviewCreate, ReviewUpdate, ReviewResponse
from services.auth import get_current_user

router = APIRouter(tags=["Reviews"])


def _recalculate_rating(db: Session, restaurant_id: int):
    """Recalculate avg_rating and review_count for a restaurant."""
    result = db.query(
        func.avg(Review.rating),
        func.count(Review.id),
    ).filter(Review.restaurant_id == restaurant_id).first()

    restaurant = db.query(Restaurant).filter(Restaurant.id == restaurant_id).first()
    if restaurant:
        restaurant.avg_rating = round(float(result[0] or 0), 2)
        restaurant.review_count = result[1] or 0
        db.commit()


@router.post(
    "/restaurants/{restaurant_id}/reviews",
    response_model=ReviewResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_review(
    restaurant_id: int,
    data: ReviewCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Create a review for a restaurant."""
    restaurant = db.query(Restaurant).filter(Restaurant.id == restaurant_id).first()
    if not restaurant:
        raise HTTPException(status_code=404, detail="Restaurant not found")

    # Check if user already reviewed this restaurant
    existing = db.query(Review).filter(
        Review.user_id == current_user.id,
        Review.restaurant_id == restaurant_id,
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="You have already reviewed this restaurant. Edit your existing review instead.")

    review = Review(
        user_id=current_user.id,
        restaurant_id=restaurant_id,
        rating=data.rating,
        comment=data.comment,
    )
    db.add(review)
    db.commit()
    db.refresh(review)

    _recalculate_rating(db, restaurant_id)

    return ReviewResponse(
        id=review.id, user_id=review.user_id, restaurant_id=review.restaurant_id,
        rating=review.rating, comment=review.comment,
        created_at=str(review.created_at), updated_at=str(review.updated_at),
        user_name=current_user.name, user_profile_pic=current_user.profile_pic_url,
    )


@router.get("/restaurants/{restaurant_id}/reviews", response_model=list[ReviewResponse])
def list_reviews(restaurant_id: int, db: Session = Depends(get_db)):
    """List all reviews for a restaurant."""
    reviews = (
        db.query(Review, User.name, User.profile_pic_url)
        .join(User, Review.user_id == User.id)
        .filter(Review.restaurant_id == restaurant_id)
        .order_by(Review.created_at.desc())
        .all()
    )
    return [
        ReviewResponse(
            id=r.id, user_id=r.user_id, restaurant_id=r.restaurant_id,
            rating=r.rating, comment=r.comment,
            created_at=str(r.created_at), updated_at=str(r.updated_at),
            user_name=name, user_profile_pic=pic,
        )
        for r, name, pic in reviews
    ]


@router.put("/reviews/{review_id}", response_model=ReviewResponse)
def update_review(
    review_id: int,
    data: ReviewUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Update own review."""
    review = db.query(Review).filter(Review.id == review_id).first()
    if not review:
        raise HTTPException(status_code=404, detail="Review not found")
    if review.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="You can only edit your own reviews")

    update_data = data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(review, key, value)
    db.commit()
    db.refresh(review)

    _recalculate_rating(db, review.restaurant_id)

    return ReviewResponse(
        id=review.id, user_id=review.user_id, restaurant_id=review.restaurant_id,
        rating=review.rating, comment=review.comment,
        created_at=str(review.created_at), updated_at=str(review.updated_at),
        user_name=current_user.name, user_profile_pic=current_user.profile_pic_url,
    )


@router.delete("/reviews/{review_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_review(
    review_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Delete own review."""
    review = db.query(Review).filter(Review.id == review_id).first()
    if not review:
        raise HTTPException(status_code=404, detail="Review not found")
    if review.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="You can only delete your own reviews")

    restaurant_id = review.restaurant_id
    db.delete(review)
    db.commit()
    _recalculate_rating(db, restaurant_id)
