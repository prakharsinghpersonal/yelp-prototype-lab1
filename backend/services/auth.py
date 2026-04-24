from __future__ import annotations

import os
from datetime import datetime, timedelta, timezone
from uuid import uuid4

import bcrypt
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from pymongo.database import Database

from db.database import get_db, utcnow
from services.document_utils import serialize_user

SECRET_KEY = os.getenv("SECRET_KEY", "fallback-secret-if-not-in-env")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "60"))

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")


def _coerce_utc(value):
    if value is None:
        return None
    if value.tzinfo is None:
        return value.replace(tzinfo=timezone.utc)
    return value.astimezone(timezone.utc)


def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    try:
        return bcrypt.checkpw(plain_password.encode("utf-8"), hashed_password.encode("utf-8"))
    except Exception:
        return False


def create_access_token(data: dict, expires_delta: timedelta | None = None) -> str:
    to_encode = data.copy()
    issued_at = datetime.now(timezone.utc)
    expire = issued_at + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire, "iat": issued_at, "jti": str(uuid4())})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


def create_session(db: Database, user_id: int, token: str) -> dict:
    expires_at = utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    session = {
        "session_id": str(uuid4()),
        "user_id": user_id,
        "token": token,
        "expires_at": expires_at,
        "created_at": utcnow(),
    }
    db.sessions.insert_one(session)
    session.pop("_id", None)
    return session


def revoke_session(db: Database, token: str) -> None:
    db.sessions.delete_one({"token": token})


def get_current_user(token: str = Depends(oauth2_scheme), db: Database = Depends(get_db)) -> dict:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials - please log in again",
        headers={"WWW-Authenticate": "Bearer"},
    )

    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = payload.get("sub")
        if user_id is None:
            raise credentials_exception
    except JWTError as exc:
        raise credentials_exception from exc

    session = db.sessions.find_one({"token": token})
    expires_at = _coerce_utc(session.get("expires_at")) if session else None
    if not session or expires_at is None or expires_at <= utcnow():
        raise credentials_exception

    user = db.users.find_one({"id": int(user_id)})
    if not user:
        raise credentials_exception

    return serialize_user(user, include_password=True)
