"""User routes - Profile, preferences, and user data management"""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from db.database import get_db
from models.models import User, UserPreference
from models.schemas import UserResponse, UserPreferenceUpdate, UserPreferenceResponse, UserUpdate
from services.auth import get_current_user
from typing import List

# Create a new router for user-related endpoints
router = APIRouter(prefix="/users", tags=["Users"])

@router.get("/", response_model=List[UserResponse])
def get_all_users(db: Session = Depends(get_db)):
    """Fetch all users (Public logic for demo purposes)"""
    return db.query(User).all()

# Note the dependency: 'current_user: User = Depends(get_current_user)'
# This one line instantly protects this route! If the user doesn't send 
# a valid JWT token, they get a 401 error and the code below never runs.
@router.get("/me", response_model=UserResponse)
def get_my_profile(current_user: User = Depends(get_current_user)):
    """
    Get the currently logged-in user's profile.
    """
    # Simply return the user we extracted from the token. 
    # FastAPI and our UserResponse schema will automatically format it to hide the password!
    return current_user


@router.put("/me", response_model=UserResponse)
def update_my_profile(
    req: UserUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Update the currently logged-in user's profile.
    """
    for key, value in req.model_dump(exclude_unset=True).items():
        setattr(current_user, key, value)
        
    db.commit()
    db.refresh(current_user)
    return current_user


# --- USER PREFERENCES ---

@router.get("/me/preferences", response_model=UserPreferenceResponse)
def get_my_preferences(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Get AI chat preferences for the current logged in user"""
    pref = db.query(UserPreference).filter(UserPreference.user_id == current_user.id).first()
    if not pref:
        # Create an empty preference row if it doesn't exist yet
        pref = UserPreference(user_id=current_user.id)
        db.add(pref)
        db.commit()
        db.refresh(pref)
    return pref


@router.put("/me/preferences", response_model=UserPreferenceResponse)
def update_my_preferences(
    req: UserPreferenceUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update AI chat preferences"""
    pref = db.query(UserPreference).filter(UserPreference.user_id == current_user.id).first()
    if not pref:
        pref = UserPreference(user_id=current_user.id)
        db.add(pref)
        
    for key, value in req.model_dump(exclude_unset=True).items():
        setattr(pref, key, value)
        
    db.commit()
    db.refresh(pref)
    return pref
