import os
import shutil
import uuid
from typing import List

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile
from pymongo.database import Database

from db.database import get_db, next_sequence, utcnow
from models.schemas import UserPreferenceResponse, UserPreferenceUpdate, UserResponse, UserUpdate
from services.auth import get_current_user
from services.document_utils import serialize_preference, serialize_user

router = APIRouter(prefix="/users", tags=["Users"])


@router.get("/", response_model=List[UserResponse])
def get_all_users(db: Database = Depends(get_db)):
    return [serialize_user(user) for user in db.users.find().sort("id", 1)]


@router.get("/me", response_model=UserResponse)
def get_my_profile(current_user: dict = Depends(get_current_user)):
    return serialize_user(current_user)


@router.put("/me", response_model=UserResponse)
def update_my_profile(
    req: UserUpdate,
    current_user: dict = Depends(get_current_user),
    db: Database = Depends(get_db),
):
    updates = {key: value for key, value in req.model_dump(exclude_unset=True).items()}
    if updates:
        updates["updated_at"] = utcnow()
        db.users.update_one({"id": current_user["id"]}, {"$set": updates})
    return serialize_user(db.users.find_one({"id": current_user["id"]}))


@router.post("/me/photo", response_model=UserResponse)
def upload_profile_photo(
    file: UploadFile = File(...),
    current_user: dict = Depends(get_current_user),
    db: Database = Depends(get_db),
):
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image")

    upload_dir = os.path.join("uploads", "users")
    os.makedirs(upload_dir, exist_ok=True)

    ext = file.filename.split(".")[-1] if "." in file.filename else "jpg"
    filename = f"user_{current_user['id']}_{uuid.uuid4().hex}.{ext}"
    file_path = os.path.join(upload_dir, filename)
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    url = f"/uploads/users/{filename}"
    db.users.update_one(
        {"id": current_user["id"]},
        {"$set": {"profile_pic_url": url, "updated_at": utcnow()}},
    )
    return serialize_user(db.users.find_one({"id": current_user["id"]}))


@router.get("/me/preferences", response_model=UserPreferenceResponse)
def get_my_preferences(current_user: dict = Depends(get_current_user), db: Database = Depends(get_db)):
    pref = db.user_preferences.find_one({"user_id": current_user["id"]})
    if not pref:
        pref = {
            "id": next_sequence(db, "user_preferences"),
            "user_id": current_user["id"],
            "cuisines": [],
            "price_range": None,
            "location": None,
            "preferred_locations": [],
            "search_radius": None,
            "dietary_needs": [],
            "ambiance": [],
            "sort_preference": None,
            "created_at": utcnow(),
            "updated_at": utcnow(),
        }
        db.user_preferences.insert_one(pref)
    return serialize_preference(pref)


@router.put("/me/preferences", response_model=UserPreferenceResponse)
def update_my_preferences(
    req: UserPreferenceUpdate,
    current_user: dict = Depends(get_current_user),
    db: Database = Depends(get_db),
):
    existing = db.user_preferences.find_one({"user_id": current_user["id"]})
    if not existing:
        existing = {
            "id": next_sequence(db, "user_preferences"),
            "user_id": current_user["id"],
            "created_at": utcnow(),
        }
        db.user_preferences.insert_one(existing)

    updates = {key: value for key, value in req.model_dump(exclude_unset=True).items()}
    updates["updated_at"] = utcnow()
    db.user_preferences.update_one({"user_id": current_user["id"]}, {"$set": updates})
    return serialize_preference(db.user_preferences.find_one({"user_id": current_user["id"]}))
