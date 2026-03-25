import os
import shutil
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query, UploadFile, File, status
from sqlalchemy.orm import Session
from sqlalchemy import or_, func

from db.database import get_db
from models.models import User, Restaurant, Photo
from models.schemas import RestaurantCreate, RestaurantUpdate, RestaurantResponse
from services.auth import get_current_user

router = APIRouter(prefix="/restaurants", tags=["Restaurants"])

UPLOAD_DIR = os.getenv("UPLOAD_DIR", "uploads")


@router.get("/", response_model=list[RestaurantResponse])
def list_restaurants(
    search: Optional[str] = Query(None, description="Search by name or keyword"),
    cuisine: Optional[str] = Query(None),
    city: Optional[str] = Query(None),
    zip_code: Optional[str] = Query(None, alias="zip"),
    price_tier: Optional[str] = Query(None),
    sort_by: Optional[str] = Query("rating", enum=["rating", "name", "review_count"]),
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
):
    """Search and list restaurants with filters."""
    query = db.query(Restaurant)

    if search:
        search_term = f"%{search}%"
        query = query.filter(
            or_(
                Restaurant.name.ilike(search_term),
                Restaurant.description.ilike(search_term),
                Restaurant.cuisine_type.ilike(search_term),
            )
        )
    if cuisine:
        query = query.filter(Restaurant.cuisine_type.ilike(f"%{cuisine}%"))
    if city:
        query = query.filter(Restaurant.city.ilike(f"%{city}%"))
    if zip_code:
        query = query.filter(Restaurant.zip == zip_code)
    if price_tier:
        query = query.filter(Restaurant.price_tier == price_tier)

    # Sorting
    if sort_by == "rating":
        query = query.order_by(Restaurant.avg_rating.desc())
    elif sort_by == "name":
        query = query.order_by(Restaurant.name.asc())
    elif sort_by == "review_count":
        query = query.order_by(Restaurant.review_count.desc())

    # Pagination
    offset = (page - 1) * limit
    restaurants = query.offset(offset).limit(limit).all()

    # Attach photos
    results = []
    for r in restaurants:
        photos = db.query(Photo).filter(Photo.restaurant_id == r.id).all()
        r_dict = {
            "id": r.id, "name": r.name, "cuisine_type": r.cuisine_type,
            "description": r.description, "address": r.address, "city": r.city,
            "zip": r.zip, "phone": r.phone, "hours": r.hours,
            "price_tier": r.price_tier, "amenities": r.amenities,
            "avg_rating": float(r.avg_rating) if r.avg_rating else 0.0,
            "review_count": r.review_count, "view_count": r.view_count,
            "owner_id": r.owner_id, "created_by": r.created_by,
            "photos": [{"id": p.id, "url": p.url} for p in photos],
        }
        results.append(r_dict)
    return results


@router.get("/{restaurant_id}", response_model=RestaurantResponse)
def get_restaurant(restaurant_id: int, db: Session = Depends(get_db)):
    """Get restaurant details by ID."""
    restaurant = db.query(Restaurant).filter(Restaurant.id == restaurant_id).first()
    if not restaurant:
        raise HTTPException(status_code=404, detail="Restaurant not found")

    # Increment view count
    restaurant.view_count = (restaurant.view_count or 0) + 1
    db.commit()

    photos = db.query(Photo).filter(Photo.restaurant_id == restaurant.id).all()
    return {
        "id": restaurant.id, "name": restaurant.name,
        "cuisine_type": restaurant.cuisine_type, "description": restaurant.description,
        "address": restaurant.address, "city": restaurant.city, "zip": restaurant.zip,
        "phone": restaurant.phone, "hours": restaurant.hours,
        "price_tier": restaurant.price_tier, "amenities": restaurant.amenities,
        "avg_rating": float(restaurant.avg_rating) if restaurant.avg_rating else 0.0,
        "review_count": restaurant.review_count, "view_count": restaurant.view_count,
        "owner_id": restaurant.owner_id, "created_by": restaurant.created_by,
        "photos": [{"id": p.id, "url": p.url} for p in photos],
    }


@router.post("/", response_model=RestaurantResponse, status_code=status.HTTP_201_CREATED)
def create_restaurant(
    data: RestaurantCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Create a new restaurant listing."""
    restaurant = Restaurant(
        **data.model_dump(),
        created_by=current_user.id,
        owner_id=current_user.id if current_user.role == "owner" else None,
    )
    db.add(restaurant)
    db.commit()
    db.refresh(restaurant)
    return {
        "id": restaurant.id, "name": restaurant.name,
        "cuisine_type": restaurant.cuisine_type, "description": restaurant.description,
        "address": restaurant.address, "city": restaurant.city, "zip": restaurant.zip,
        "phone": restaurant.phone, "hours": restaurant.hours,
        "price_tier": restaurant.price_tier, "amenities": restaurant.amenities,
        "avg_rating": 0.0, "review_count": 0, "view_count": 0,
        "owner_id": restaurant.owner_id, "created_by": restaurant.created_by,
        "photos": [],
    }


@router.put("/{restaurant_id}", response_model=RestaurantResponse)
def update_restaurant(
    restaurant_id: int,
    data: RestaurantUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Update a restaurant (owner or creator only)."""
    restaurant = db.query(Restaurant).filter(Restaurant.id == restaurant_id).first()
    if not restaurant:
        raise HTTPException(status_code=404, detail="Restaurant not found")
    if restaurant.created_by != current_user.id and restaurant.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to update this restaurant")

    update_data = data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(restaurant, key, value)
    db.commit()
    db.refresh(restaurant)

    photos = db.query(Photo).filter(Photo.restaurant_id == restaurant.id).all()
    return {
        "id": restaurant.id, "name": restaurant.name,
        "cuisine_type": restaurant.cuisine_type, "description": restaurant.description,
        "address": restaurant.address, "city": restaurant.city, "zip": restaurant.zip,
        "phone": restaurant.phone, "hours": restaurant.hours,
        "price_tier": restaurant.price_tier, "amenities": restaurant.amenities,
        "avg_rating": float(restaurant.avg_rating) if restaurant.avg_rating else 0.0,
        "review_count": restaurant.review_count, "view_count": restaurant.view_count,
        "owner_id": restaurant.owner_id, "created_by": restaurant.created_by,
        "photos": [{"id": p.id, "url": p.url} for p in photos],
    }


@router.delete("/{restaurant_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_restaurant(
    restaurant_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Delete a restaurant (owner or creator only)."""
    restaurant = db.query(Restaurant).filter(Restaurant.id == restaurant_id).first()
    if not restaurant:
        raise HTTPException(status_code=404, detail="Restaurant not found")
    if restaurant.created_by != current_user.id and restaurant.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")
    db.delete(restaurant)
    db.commit()


# --- Photo Upload ---
@router.post("/{restaurant_id}/photos")
def upload_restaurant_photo(
    restaurant_id: int,
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Upload a photo for a restaurant."""
    restaurant = db.query(Restaurant).filter(Restaurant.id == restaurant_id).first()
    if not restaurant:
        raise HTTPException(status_code=404, detail="Restaurant not found")

    os.makedirs(f"{UPLOAD_DIR}/restaurants", exist_ok=True)
    ext = file.filename.split(".")[-1] if "." in file.filename else "jpg"
    photo_count = db.query(Photo).filter(Photo.restaurant_id == restaurant_id).count()
    filename = f"restaurant_{restaurant_id}_{photo_count + 1}.{ext}"
    filepath = f"{UPLOAD_DIR}/restaurants/{filename}"

    with open(filepath, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    photo = Photo(restaurant_id=restaurant_id, url=f"/static/restaurants/{filename}")
    db.add(photo)
    db.commit()
    db.refresh(photo)
    return {"id": photo.id, "url": photo.url}
