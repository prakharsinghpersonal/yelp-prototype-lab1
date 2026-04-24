from __future__ import annotations

from copy import deepcopy
from typing import Any


def _clean(doc: dict[str, Any] | None) -> dict[str, Any] | None:
    if not doc:
        return None
    cleaned = deepcopy(doc)
    cleaned.pop("_id", None)
    return cleaned


def serialize_user(doc: dict[str, Any] | None, include_password: bool = False) -> dict[str, Any] | None:
    cleaned = _clean(doc)
    if not cleaned:
        return None
    if not include_password:
        cleaned.pop("password_hash", None)
    return cleaned


def serialize_restaurant(doc: dict[str, Any] | None) -> dict[str, Any] | None:
    cleaned = _clean(doc)
    if not cleaned:
        return None
    cleaned.setdefault("amenities", [])
    cleaned.setdefault("photos", [])
    cleaned.setdefault("activity_logs", [])
    cleaned.setdefault("avg_rating", 0.0)
    cleaned.setdefault("review_count", 0)
    cleaned.setdefault("view_count", 0)
    return cleaned


def serialize_review(doc: dict[str, Any] | None) -> dict[str, Any] | None:
    cleaned = _clean(doc)
    if not cleaned:
        return None
    cleaned.setdefault("comment", None)
    cleaned.setdefault("status", "processed")
    cleaned.setdefault("photo_urls", [])
    return cleaned


def serialize_favorite(
    doc: dict[str, Any] | None,
    restaurant: dict[str, Any] | None = None,
) -> dict[str, Any] | None:
    cleaned = _clean(doc)
    if not cleaned:
        return None
    if restaurant is not None:
        cleaned["restaurant"] = serialize_restaurant(restaurant)
    return cleaned


def serialize_preference(doc: dict[str, Any] | None) -> dict[str, Any] | None:
    cleaned = _clean(doc)
    if not cleaned:
        return None
    cleaned.setdefault("cuisines", [])
    cleaned.setdefault("preferred_locations", [])
    cleaned.setdefault("dietary_needs", [])
    cleaned.setdefault("ambiance", [])
    return cleaned
