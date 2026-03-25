from fastapi import APIRouter, Depends, HTTPException, Query, status, UploadFile, File
from sqlalchemy.orm import Session
from typing import Optional
import os, uuid, shutil

from db.database import get_db
from models.models import User, Restaurant
from models.schemas import RestaurantCreate, RestaurantResponse
from services.auth import get_current_user

router = APIRouter(prefix="/restaurants", tags=["Restaurants"])


# --- LIST / SEARCH RESTAURANTS (Public) ---
@router.get("", response_model=list[RestaurantResponse])
def list_restaurants(
    search: Optional[str] = Query(None, description="Search by name"),
    cuisine: Optional[str] = Query(None, description="Filter by cuisine type"),
    city: Optional[str] = Query(None, description="Filter by city"),
    price_tier: Optional[str] = Query(None, description="Filter by price tier"),
    db: Session = Depends(get_db),
):
    query = db.query(Restaurant)

    if search:
        query = query.filter(Restaurant.name.ilike(f"%{search}%"))
    if cuisine:
        query = query.filter(Restaurant.cuisine_type.ilike(f"%{cuisine}%"))
    if city:
        query = query.filter(Restaurant.city.ilike(f"%{city}%"))
    if price_tier:
        query = query.filter(Restaurant.price_tier == price_tier)

    return query.order_by(Restaurant.avg_rating.desc()).all()


# --- GET SINGLE RESTAURANT (Public) ---
@router.get("/{restaurant_id}", response_model=RestaurantResponse)
def get_restaurant(restaurant_id: int, db: Session = Depends(get_db)):
    restaurant = db.query(Restaurant).filter(Restaurant.id == restaurant_id).first()
    if not restaurant:
        raise HTTPException(status_code=404, detail="Restaurant not found")
    return restaurant


# --- CREATE RESTAURANT (Protected) ---
@router.post("", response_model=RestaurantResponse, status_code=status.HTTP_201_CREATED)
def create_restaurant(
    req: RestaurantCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    new_restaurant = Restaurant(
        name=req.name,
        cuisine_type=req.cuisine_type,
        description=req.description,
        address=req.address,
        city=req.city,
        state=req.state,
        zip_code=req.zip_code,
        phone=req.phone,
        hours=req.hours,
        image_url=req.image_url,
        price_tier=req.price_tier,
        amenities=req.amenities,
        owner_id=current_user.id,
    )

    db.add(new_restaurant)
    db.commit()
    db.refresh(new_restaurant)
    return new_restaurant


# --- UPDATE RESTAURANT (Protected — owner only) ---
@router.put("/{restaurant_id}", response_model=RestaurantResponse)
def update_restaurant(
    restaurant_id: int,
    req: RestaurantCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Update a restaurant listing — only the creator/owner can edit"""
    restaurant = db.query(Restaurant).filter(Restaurant.id == restaurant_id).first()
    if not restaurant:
        raise HTTPException(status_code=404, detail="Restaurant not found")
    if restaurant.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Only the restaurant owner can update this listing")

    for key, value in req.model_dump(exclude_unset=True).items():
        setattr(restaurant, key, value)

    db.commit()
    db.refresh(restaurant)
    return restaurant


# --- DELETE RESTAURANT (Protected — owner only) ---
@router.delete("/{restaurant_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_restaurant(
    restaurant_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Delete a restaurant listing — only the creator/owner can delete"""
    restaurant = db.query(Restaurant).filter(Restaurant.id == restaurant_id).first()
    if not restaurant:
        raise HTTPException(status_code=404, detail="Restaurant not found")
    if restaurant.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Only the restaurant owner can delete this listing")

    db.delete(restaurant)
    db.commit()
    return None


# --- OWNER DASHBOARD (Protected — owner only) ---
@router.get("/owner/dashboard")
def owner_dashboard(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Return analytics and recent reviews for the owner's primary restaurant"""
    if current_user.role != "owner":
        raise HTTPException(status_code=403, detail="Owner access required")

    from models.models import Review, Favorite
    owned = db.query(Restaurant).filter(Restaurant.owner_id == current_user.id).all()

    if not owned:
        return {"restaurant": None, "analytics": None, "recent_reviews": [], "all_restaurants": []}

    # Use first owned restaurant as primary; also return all for multi-restaurant owners
    primary = owned[0]

    all_reviews = db.query(Review).filter(Review.restaurant_id == primary.id).all()
    recent_reviews = sorted(all_reviews, key=lambda r: r.created_at or "", reverse=True)[:5]
    total_favorites = db.query(Favorite).filter(Favorite.restaurant_id == primary.id).count()

    rating_dist = {1: 0, 2: 0, 3: 0, 4: 0, 5: 0}
    for rv in all_reviews:
        if rv.rating in rating_dist:
            rating_dist[rv.rating] += 1

    return {
        "restaurant": {
            "id": primary.id,
            "name": primary.name,
            "cuisine_type": primary.cuisine_type,
            "city": primary.city,
            "image_url": primary.image_url,
            "price_tier": primary.price_tier,
        },
        "analytics": {
            "total_views": primary.view_count or 0,
            "avg_rating": primary.avg_rating or 0,
            "total_reviews": len(all_reviews),
            "total_favorites": total_favorites,
            "rating_distribution": rating_dist,
        },
        "recent_reviews": [
            {
                "id": rv.id,
                "rating": rv.rating,
                "comment": rv.comment,
                "user_name": rv.user.name if rv.user else "Anonymous",
                "created_at": str(rv.created_at) if rv.created_at else None,
            }
            for rv in recent_reviews
        ],
        "all_restaurants": [
            {"id": r.id, "name": r.name, "avg_rating": r.avg_rating, "review_count": r.review_count}
            for r in owned
        ],
    }


# --- OWNER PRIMARY RESTAURANT (Protected — owner only) ---
@router.get("/owner/restaurant")
def get_owner_restaurant(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Return the owner's primary restaurant for the manage profile page"""
    if current_user.role != "owner":
        raise HTTPException(status_code=403, detail="Owner access required")

    restaurant = db.query(Restaurant).filter(Restaurant.owner_id == current_user.id).first()
    if not restaurant:
        raise HTTPException(status_code=404, detail="No restaurant found. Please add or claim one first.")
    return restaurant


# --- OWNER REVIEWS — all reviews for owned restaurants ---
@router.get("/owner/reviews")
def get_owner_reviews(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Return all reviews for all restaurants owned by the current user"""
    if current_user.role != "owner":
        raise HTTPException(status_code=403, detail="Owner access required")

    from models.models import Review, User as UserModel
    owned_ids = [r.id for r in db.query(Restaurant).filter(Restaurant.owner_id == current_user.id).all()]
    if not owned_ids:
        return []

    reviews = db.query(Review).filter(Review.restaurant_id.in_(owned_ids)).order_by(Review.created_at.desc()).all()
    return [
        {
            "id": rv.id,
            "restaurant_id": rv.restaurant_id,
            "restaurant_name": rv.restaurant.name if rv.restaurant else "Unknown",
            "rating": rv.rating,
            "comment": rv.comment,
            "user_name": rv.user.name if rv.user else "Anonymous",
            "created_at": str(rv.created_at) if rv.created_at else None,
        }
        for rv in reviews
    ]


# --- UPLOAD RESTAURANT PHOTO (Protected) ---
@router.post("/{restaurant_id}/photos")
def upload_restaurant_photo(
    restaurant_id: int,
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Upload a photo for a restaurant and set it as the main image"""
    restaurant = db.query(Restaurant).filter(Restaurant.id == restaurant_id).first()
    if not restaurant:
        raise HTTPException(status_code=404, detail="Restaurant not found")
    if restaurant.owner_id != current_user.id:
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
    restaurant.image_url = url
    db.commit()
    db.refresh(restaurant)
    return {"url": url, "image_url": url}


# --- CLAIM RESTAURANT (Protected) ---
@router.post("/{restaurant_id}/claim", status_code=status.HTTP_200_OK)
def claim_restaurant(
    restaurant_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Allow an owner to claim an existing unclaimed restaurant"""
    restaurant = db.query(Restaurant).filter(Restaurant.id == restaurant_id).first()
    if not restaurant:
        raise HTTPException(status_code=404, detail="Restaurant not found")
    if restaurant.owner_id is not None and restaurant.owner_id != current_user.id:
        raise HTTPException(status_code=400, detail="Restaurant already claimed by another owner")

    restaurant.owner_id = current_user.id
    db.commit()
    db.refresh(restaurant)
    return {"message": "Restaurant claimed successfully", "restaurant_id": restaurant_id}
