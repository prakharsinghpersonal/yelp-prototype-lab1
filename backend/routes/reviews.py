import os
import shutil
import uuid
from typing import List

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status
from pymongo.database import Database

from db.database import get_db, utcnow
from models.schemas import ReviewCreate, ReviewResponse
from services.auth import get_current_user
from services.document_utils import serialize_review
from services.event_bus import publish_event

router = APIRouter(tags=["Reviews"])


@router.get("/restaurants/{restaurant_id}/reviews", response_model=List[ReviewResponse])
def get_restaurant_reviews(restaurant_id: int, db: Database = Depends(get_db)):
    reviews = db.reviews.find({"restaurant_id": restaurant_id}).sort("created_at", -1)
    user_ids = [review["user_id"] for review in reviews]
    users = {user["id"]: user for user in db.users.find({"id": {"$in": user_ids}})}
    return [
        {
            **serialize_review(review),
            "user_name": users.get(review["user_id"], {}).get("name", "Anonymous"),
            "created_at": str(review.get("created_at")) if review.get("created_at") else None,
        }
        for review in reviews
    ]


@router.post("/restaurants/{restaurant_id}/reviews", response_model=ReviewResponse, status_code=status.HTTP_201_CREATED)
def create_review(
    restaurant_id: int,
    req: ReviewCreate,
    current_user: dict = Depends(get_current_user),
    db: Database = Depends(get_db),
):
    if current_user.get("role") != "user":
        raise HTTPException(status_code=403, detail="Only customers can create reviews")
    restaurant = db.restaurants.find_one({"id": restaurant_id})
    if not restaurant:
        raise HTTPException(status_code=404, detail="Restaurant not found")
    existing = db.reviews.find_one({"restaurant_id": restaurant_id, "user_id": current_user["id"]})
    if existing:
        raise HTTPException(status_code=400, detail="You already reviewed this restaurant")
    return publish_event(
        db,
        "review.created",
        {
            "restaurant_id": restaurant_id,
            "user_id": current_user["id"],
            "rating": req.rating,
            "comment": req.comment,
        },
    )


@router.put("/reviews/{review_id}", response_model=ReviewResponse)
def update_review(
    review_id: int,
    req: ReviewCreate,
    current_user: dict = Depends(get_current_user),
    db: Database = Depends(get_db),
):
    if current_user.get("role") != "user":
        raise HTTPException(status_code=403, detail="Only customers can edit reviews")
    review = db.reviews.find_one({"id": review_id})
    if not review:
        raise HTTPException(status_code=404, detail="Review not found")
    if review["user_id"] != current_user["id"]:
        raise HTTPException(status_code=403, detail="You can only edit your own reviews")
    return publish_event(
        db,
        "review.updated",
        {
            "review_id": review_id,
            "rating": req.rating,
            "comment": req.comment,
        },
    )


@router.delete("/reviews/{review_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_review(review_id: int, current_user: dict = Depends(get_current_user), db: Database = Depends(get_db)):
    if current_user.get("role") != "user":
        raise HTTPException(status_code=403, detail="Only customers can delete reviews")
    review = db.reviews.find_one({"id": review_id})
    if not review:
        raise HTTPException(status_code=404, detail="Review not found")
    if review["user_id"] != current_user["id"]:
        raise HTTPException(status_code=403, detail="You can only delete your own reviews")
    publish_event(db, "review.deleted", {"review_id": review_id})
    return None


@router.post("/reviews/{review_id}/photos", response_model=ReviewResponse)
def upload_review_photo(
    review_id: int,
    file: UploadFile = File(...),
    current_user: dict = Depends(get_current_user),
    db: Database = Depends(get_db),
):
    if current_user.get("role") != "user":
        raise HTTPException(status_code=403, detail="Only customers can upload review photos")
    review = db.reviews.find_one({"id": review_id})
    if not review:
        raise HTTPException(status_code=404, detail="Review not found")
    if review["user_id"] != current_user["id"]:
        raise HTTPException(status_code=403, detail="You can only upload photos to your own review")
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image")

    upload_dir = os.path.join("uploads", "reviews")
    os.makedirs(upload_dir, exist_ok=True)
    ext = file.filename.split(".")[-1] if "." in file.filename else "jpg"
    filename = f"review_{review_id}_{uuid.uuid4().hex}.{ext}"
    file_path = os.path.join(upload_dir, filename)
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    url = f"/uploads/reviews/{filename}"
    db.reviews.update_one(
        {"id": review_id},
        {"$push": {"photo_urls": url}, "$set": {"updated_at": utcnow()}},
    )
    updated_review = db.reviews.find_one({"id": review_id})
    return {
        **serialize_review(updated_review),
        "user_name": current_user.get("name", "Anonymous"),
        "created_at": str(updated_review.get("created_at")) if updated_review.get("created_at") else None,
    }
