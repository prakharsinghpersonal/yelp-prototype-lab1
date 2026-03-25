import os
import shutil
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session

from db.database import get_db
from models.models import User, UserPreference
from models.schemas import UserUpdate, UserResponse, PreferencesUpdate, PreferencesResponse
from services.auth import get_current_user

router = APIRouter(prefix="/users", tags=["Users"])

UPLOAD_DIR = os.getenv("UPLOAD_DIR", "uploads")


@router.get("/me", response_model=UserResponse)
def get_profile(current_user: User = Depends(get_current_user)):
    """Get current user's profile."""
    return current_user


@router.put("/me", response_model=UserResponse)
def update_profile(
    data: UserUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Update current user's profile fields."""
    update_data = data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(current_user, key, value)
    db.commit()
    db.refresh(current_user)
    return current_user


@router.post("/me/photo")
def upload_profile_photo(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Upload profile picture."""
    os.makedirs(f"{UPLOAD_DIR}/profiles", exist_ok=True)
    ext = file.filename.split(".")[-1] if "." in file.filename else "jpg"
    filename = f"profile_{current_user.id}.{ext}"
    filepath = f"{UPLOAD_DIR}/profiles/{filename}"

    with open(filepath, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    current_user.profile_pic_url = f"/static/profiles/{filename}"
    db.commit()
    return {"url": current_user.profile_pic_url}


# --- Preferences ---
@router.get("/me/preferences", response_model=PreferencesResponse)
def get_preferences(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get current user's AI assistant preferences."""
    prefs = db.query(UserPreference).filter(UserPreference.user_id == current_user.id).first()
    if not prefs:
        return PreferencesResponse()
    return prefs


@router.put("/me/preferences", response_model=PreferencesResponse)
def update_preferences(
    data: PreferencesUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Create or update user preferences for AI assistant."""
    prefs = db.query(UserPreference).filter(UserPreference.user_id == current_user.id).first()
    if not prefs:
        prefs = UserPreference(user_id=current_user.id)
        db.add(prefs)

    update_data = data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(prefs, key, value)

    db.commit()
    db.refresh(prefs)
    return prefs
