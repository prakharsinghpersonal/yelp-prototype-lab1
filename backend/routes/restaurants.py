"""Restaurant routes - CRUD operations, search, and listing with pagination"""
from fastapi import APIRouter, Depends, HTTPException, Query, status, UploadFile, File
import os
import shutil
import uuid
from sqlalchemy.orm import Session
from typing import Optional

from db.database import get_db
from models.models import User, Restaurant
from models.schemas import RestaurantCreate, RestaurantResponse
from services.auth import get_current_user

router = APIRouter(prefix="/restaurants", tags=["Restaurants"])


# --- LIST / SEARCH RESTAURANTS (Public) ---
@router.get("", response_model=list[RestaurantResponse])
def list_restaurants(
    skip: int = Query(0, ge=0, description="Number of items to skip"),
    limit: int = Query(10, ge=1, le=100, description="Max items to return"),
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

    return query.order_by(Restaurant.avg_rating.desc()).offset(skip).limit(limit).all()


# --- OWNER DASHBOARD ---
@router.get("/owner/dashboard")
def get_owner_dashboard(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Returns analytics data for restaurants owned by the current user."""
    if current_user.role != "owner":
        raise HTTPException(status_code=403, detail="Only owner accounts have a dashboard")
        
    owned_restaurants = db.query(Restaurant).filter(Restaurant.owner_id == current_user.id).all()
    
    if not owned_restaurants:
        return {"total_restaurants": 0, "restaurants": [], "analytics": {}}
        
    total_reviews = sum(r.review_count for r in owned_restaurants)
    average_rating = sum(r.avg_rating for r in owned_restaurants) / len(owned_restaurants) if owned_restaurants else 0
    
    return {
        "total_restaurants": len(owned_restaurants),
        "total_views": len(owned_restaurants) * 1250, # mock data for dashboard
        "total_reviews": total_reviews,
        "average_rating": round(average_rating, 1),
        "ratings_distribution": {"5_star": 45, "4_star": 30, "3_star": 15, "2_star": 5, "1_star": 5}, # mock
        "overall_sentiment": "Positive", # mock
        "restaurants": [{"id": r.id, "name": r.name, "rating": r.avg_rating, "reviews": r.review_count} for r in owned_restaurants]
    }

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


# --- UPLOAD RESTAURANT PHOTO (Protected — owner only) ---
@router.post("/{restaurant_id}/photos", response_model=RestaurantResponse)
def upload_restaurant_photo(
    restaurant_id: int,
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Upload a photo for a restaurant — only the creator/owner can upload"""
    restaurant = db.query(Restaurant).filter(Restaurant.id == restaurant_id).first()
    if not restaurant:
        raise HTTPException(status_code=404, detail="Restaurant not found")
    if restaurant.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Only the restaurant owner can upload photos")
        
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image")
        
    upload_dir = os.path.join("uploads", "restaurants")
    os.makedirs(upload_dir, exist_ok=True)
    
    ext = file.filename.split('.')[-1] if '.' in file.filename else "jpg"
    filename = f"rest_{restaurant.id}_{uuid.uuid4().hex}.{ext}"
    file_path = os.path.join(upload_dir, filename)
    
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
        
    url = f"/uploads/restaurants/{filename}"
    restaurant.image_url = url
    
    db.commit()
    db.refresh(restaurant)
    return restaurant


# --- CLAIM RESTAURANT (Protected — owner only) ---
@router.post("/{restaurant_id}/claim", response_model=RestaurantResponse)
def claim_restaurant(
    restaurant_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Claim an existing restaurant listing. Must be an owner account."""
    if current_user.role != "owner":
        raise HTTPException(status_code=403, detail="Only owner accounts can claim restaurants")
        
    restaurant = db.query(Restaurant).filter(Restaurant.id == restaurant_id).first()
    if not restaurant:
        raise HTTPException(status_code=404, detail="Restaurant not found")
        
    if restaurant.owner_id is not None and restaurant.owner_id != current_user.id:
        raise HTTPException(status_code=400, detail="Restaurant is already claimed")
        
    restaurant.owner_id = current_user.id
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
