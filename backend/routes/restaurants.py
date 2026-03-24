from fastapi import APIRouter, Depends, HTTPException, Query, status
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
