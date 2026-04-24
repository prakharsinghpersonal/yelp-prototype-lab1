from fastapi import APIRouter, Depends, HTTPException, status
from pymongo.database import Database

from db.database import get_db, next_sequence, utcnow
from models.schemas import LoginRequest, OwnerSignupRequest, SignupRequest, TokenResponse
from services.auth import create_access_token, create_session, hash_password, verify_password
from services.document_utils import serialize_user

router = APIRouter(prefix="/auth", tags=["Authentication"])


def _issue_token(db: Database, user: dict) -> TokenResponse:
    token = create_access_token({"sub": str(user["id"])})
    session = create_session(db, user["id"], token)
    return TokenResponse(access_token=token, token_type="bearer", session_id=session["session_id"])


def _create_user(db: Database, payload: dict, role: str) -> dict:
    existing = db.users.find_one({"email": payload["email"]})
    if existing:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email already registered")

    now = utcnow()
    user = {
        "id": next_sequence(db, "users"),
        "name": payload["name"],
        "email": payload["email"],
        "password_hash": hash_password(payload["password"]),
        "phone": payload.get("phone"),
        "about_me": None,
        "city": payload.get("city"),
        "state": payload.get("state"),
        "country": payload.get("country"),
        "language": None,
        "gender": None,
        "profile_pic_url": None,
        "role": role,
        "owner_restaurant_name": payload.get("restaurant_name"),
        "owner_restaurant_location": payload.get("restaurant_location"),
        "created_at": now,
        "updated_at": now,
    }
    db.users.insert_one(user)
    return serialize_user(user, include_password=True)


@router.post("/signup", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
def signup(req: SignupRequest, db: Database = Depends(get_db)):
    user = _create_user(db, req.model_dump(), req.role or "user")
    return _issue_token(db, user)


@router.post("/login", response_model=TokenResponse)
def login(req: LoginRequest, db: Database = Depends(get_db)):
    user = db.users.find_one({"email": req.email})
    if not user or not verify_password(req.password, user["password_hash"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return _issue_token(db, serialize_user(user, include_password=True))


@router.post("/owner/signup", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
def owner_signup(req: OwnerSignupRequest, db: Database = Depends(get_db)):
    user = _create_user(db, req.model_dump(), "owner")
    return _issue_token(db, user)


@router.post("/owner/login", response_model=TokenResponse)
def owner_login(req: LoginRequest, db: Database = Depends(get_db)):
    user = db.users.find_one({"email": req.email})
    if not user or not verify_password(req.password, user["password_hash"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    if user.get("role") != "owner":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account does not have owner privileges",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return _issue_token(db, serialize_user(user, include_password=True))
