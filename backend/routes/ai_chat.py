import os
import json
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import or_

from db.database import get_db
from models.models import User, UserPreference, Restaurant
from models.schemas import ChatRequest, ChatResponse
from services.auth import get_current_user

router = APIRouter(prefix="/ai-assistant", tags=["AI Assistant"])


def _get_restaurant_context(db: Session, filters: dict, limit: int = 10) -> list[dict]:
    """Query restaurants based on extracted filters."""
    query = db.query(Restaurant)

    if filters.get("cuisine"):
        query = query.filter(Restaurant.cuisine_type.ilike(f"%{filters['cuisine']}%"))
    if filters.get("city"):
        query = query.filter(Restaurant.city.ilike(f"%{filters['city']}%"))
    if filters.get("price_tier"):
        query = query.filter(Restaurant.price_tier == filters["price_tier"])
    if filters.get("search"):
        term = f"%{filters['search']}%"
        query = query.filter(
            or_(
                Restaurant.name.ilike(term),
                Restaurant.description.ilike(term),
                Restaurant.cuisine_type.ilike(term),
            )
        )

    query = query.order_by(Restaurant.avg_rating.desc())
    restaurants = query.limit(limit).all()

    return [
        {
            "id": r.id,
            "name": r.name,
            "cuisine_type": r.cuisine_type,
            "city": r.city,
            "avg_rating": float(r.avg_rating) if r.avg_rating else 0.0,
            "price_tier": r.price_tier,
            "review_count": r.review_count,
            "description": (r.description or "")[:200],
        }
        for r in restaurants
    ]


@router.post("/chat", response_model=ChatResponse)
async def chat(
    req: ChatRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """AI-powered restaurant recommendation chatbot."""
    try:
        from langchain_google_genai import ChatGoogleGenerativeAI
        from langchain.schema import HumanMessage, SystemMessage, AIMessage
    except ImportError:
        raise HTTPException(status_code=500, detail="AI dependencies not installed")

    # Load user preferences
    prefs = db.query(UserPreference).filter(UserPreference.user_id == current_user.id).first()
    pref_context = ""
    if prefs:
        pref_parts = []
        if prefs.cuisines:
            pref_parts.append(f"Favorite cuisines: {', '.join(prefs.cuisines)}")
        if prefs.price_range:
            pref_parts.append(f"Price preference: {prefs.price_range}")
        if prefs.dietary_needs:
            pref_parts.append(f"Dietary needs: {', '.join(prefs.dietary_needs)}")
        if prefs.ambiance:
            pref_parts.append(f"Ambiance preference: {', '.join(prefs.ambiance)}")
        if prefs.location:
            pref_parts.append(f"Preferred location: {prefs.location}")
        pref_context = "\n".join(pref_parts)

    # Get all restaurants for context
    all_restaurants = _get_restaurant_context(db, {}, limit=50)
    restaurant_list = "\n".join(
        [f"- {r['name']} ({r['cuisine_type']}, {r['price_tier']}, {r['avg_rating']}★, {r['city']}): {r['description']}"
         for r in all_restaurants]
    )

    # Try Tavily web search for extra context
    tavily_context = ""
    try:
        from tavily import TavilyClient
        tavily_api_key = os.getenv("TAVILY_API_KEY")
        if tavily_api_key:
            tavily = TavilyClient(api_key=tavily_api_key)
            search_result = tavily.search(
                query=f"restaurants {req.message}",
                max_results=3,
                search_depth="basic",
            )
            if search_result.get("results"):
                tavily_context = "\n\nAdditional web context:\n" + "\n".join(
                    [f"- {r.get('title', '')}: {r.get('content', '')[:200]}" for r in search_result["results"]]
                )
    except Exception:
        pass  # Tavily is optional enhancement

    system_prompt = f"""You are a friendly and helpful restaurant recommendation assistant for a Yelp-like platform.
You help users discover restaurants based on their preferences and queries.

USER PREFERENCES:
{pref_context if pref_context else "No preferences saved yet."}

AVAILABLE RESTAURANTS IN OUR DATABASE:
{restaurant_list if restaurant_list else "No restaurants in the database yet."}
{tavily_context}

INSTRUCTIONS:
- Be conversational, warm, and helpful — not robotic.
- Recommend restaurants from our database when possible.
- If the user asks about something not in our database, use web context or say you'll help them find something.
- Always explain WHY you're recommending each restaurant.
- Include key details: name, rating, price tier, cuisine type.
- If the user has preferences, factor those into your recommendations.
- Support multi-turn conversations — reference previous messages.
- Format restaurant recommendations clearly with stars and price indicators.

Respond in a natural, conversational tone. Keep recommendations to 2-4 restaurants unless asked for more."""

    # Build message history
    messages = [SystemMessage(content=system_prompt)]
    for msg in (req.conversation_history or []):
        if msg.get("role") == "user":
            messages.append(HumanMessage(content=msg["content"]))
        elif msg.get("role") == "assistant":
            messages.append(AIMessage(content=msg["content"]))
    messages.append(HumanMessage(content=req.message))

    # Call Gemini via Langchain
    google_api_key = os.getenv("GOOGLE_API_KEY")
    if not google_api_key:
        raise HTTPException(status_code=500, detail="Google API key not configured")

    llm = ChatGoogleGenerativeAI(
        model="gemini-2.0-flash",
        google_api_key=google_api_key,
        temperature=0.7,
    )
    response = llm.invoke(messages)

    # Build recommendation objects from the response
    # Return top restaurants that might be relevant
    recommendations = all_restaurants[:5] if all_restaurants else []

    return ChatResponse(
        response=response.content,
        recommendations=recommendations,
    )
