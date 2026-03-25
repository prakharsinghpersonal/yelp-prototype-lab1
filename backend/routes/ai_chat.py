import os
import json
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from groq import Groq

from db.database import get_db
from models.models import User, Restaurant, UserPreference
from models.schemas import AIChatRequest, AIChatResponse, AutofillRequest, AutofillResponse, RestaurantBrief
from services.auth import get_current_user

router = APIRouter(prefix="/ai-assistant", tags=["AI Assistant"])

@router.post("/chat", response_model=AIChatResponse)
def chat_with_ai(
    req: AIChatRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    AI chat endpoint powered by Groq (llama-3.3-70b).
    Returns restaurant recommendations based on user query.
    """
    try:
        groq_api_key = os.getenv("GROQ_API_KEY")

        if not groq_api_key:
            restaurants = db.query(Restaurant).limit(3).all()
            rest_names = ", ".join([r.name for r in restaurants]) if restaurants else "No restaurants"
            return AIChatResponse(
                response=f"I recommend checking out: {rest_names}. What type of cuisine are you interested in?"
            )

        # Load user preferences from DB
        pref = db.query(UserPreference).filter(UserPreference.user_id == current_user.id).first()
        pref_context = ""
        if pref:
            if pref.cuisines:
                pref_context += f"- Cuisine preferences: {', '.join(pref.cuisines)}\n"
            if pref.price_range:
                pref_context += f"- Price range: {pref.price_range}\n"
            if pref.dietary_needs:
                pref_context += f"- Dietary needs: {', '.join(pref.dietary_needs)}\n"
            if pref.ambiance:
                pref_context += f"- Ambiance: {', '.join(pref.ambiance)}\n"
            if pref.preferred_locations:
                pref_context += f"- Preferred locations: {', '.join(pref.preferred_locations)}\n"

        # Build restaurant context from DB (include id for matching)
        local_restaurants = db.query(Restaurant).all()
        rest_map = {r.name.lower(): r for r in local_restaurants}
        rest_context = ""
        for r in local_restaurants:
            rest_context += f"• [{r.id}] {r.name} — {r.cuisine_type}, {r.price_tier or '?'}, {r.city}, rating: {r.avg_rating:.1f}. {r.description or ''}\n"

        system_prompt = f"""You are a friendly restaurant discovery assistant for YelpStar.
Help users find great places to eat based on their preferences.

{f"User preferences:{chr(10)}{pref_context}" if pref_context else ""}
Available restaurants (format: [ID] Name — cuisine, price, city, rating):
{rest_context}

Rules:
- Recommend restaurants only from the list above using their exact names
- Prioritise restaurants that match the user's saved preferences when relevant
- Be concise, friendly and specific
- If no match found, say so honestly and suggest the closest option
- Do not make up restaurants or details"""

        # Build message history for Groq
        messages = [{"role": "system", "content": system_prompt}]
        for msg in req.conversation_history:
            role = "user" if msg.role in ["user", "human"] else "assistant"
            messages.append({"role": role, "content": msg.content})
        messages.append({"role": "user", "content": req.message})

        client = Groq(api_key=groq_api_key)
        completion = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=messages,
            temperature=0.7,
            max_tokens=512,
        )

        answer = completion.choices[0].message.content

        # Extract mentioned restaurants from the response
        answer_lower = answer.lower()
        mentioned = []
        for r in local_restaurants:
            # Match on full name or first significant word (≥4 chars)
            name_lower = r.name.lower()
            first_word = name_lower.split()[0] if name_lower.split() else ""
            if name_lower in answer_lower or (len(first_word) >= 4 and first_word in answer_lower):
                mentioned.append(RestaurantBrief(
                    id=r.id,
                    name=r.name,
                    cuisine_type=r.cuisine_type,
                    city=r.city,
                    avg_rating=r.avg_rating,
                    price_tier=r.price_tier,
                ))

        return AIChatResponse(response=answer, restaurants=mentioned)

    except HTTPException:
        raise
    except Exception as e:
        print(f"AI CHAT ERROR: {type(e).__name__}: {e}")
        restaurants = db.query(Restaurant).limit(2).all()
        if restaurants:
            rest_list = ", ".join([r.name for r in restaurants])
            return AIChatResponse(response=f"Try visiting: {rest_list}")
        return AIChatResponse(response="I encountered an issue. Please try again later.")


@router.post("/autofill", response_model=AutofillResponse)
def autofill_restaurant(
    req: AutofillRequest,
    current_user: User = Depends(get_current_user),
):
    """
    Given a restaurant name and city, use Tavily + Groq to auto-fill restaurant details.
    """
    try:
        tavily_key = os.getenv("TAVILY_API_KEY")
        groq_key = os.getenv("GROQ_API_KEY")

        if not tavily_key or not groq_key:
            raise HTTPException(status_code=503, detail="AI autofill not configured.")

        # Search with Tavily (text + images)
        from tavily import TavilyClient
        tavily = TavilyClient(api_key=tavily_key)
        query = f"{req.name} restaurant {req.city} hours phone address cuisine price"
        results = tavily.search(query=query, max_results=3, include_images=True)

        search_text = ""
        for r in results.get("results", []):
            search_text += f"{r.get('title', '')}\n{r.get('content', '')}\n\n"

        if not search_text.strip():
            raise HTTPException(status_code=404, detail="No information found for this restaurant.")

        # Pick first image that looks like a real photo (jpg/jpeg/png/webp)
        image_url = None
        for img in results.get("images", []):
            url = img if isinstance(img, str) else img.get("url", "")
            if any(ext in url.lower() for ext in [".jpg", ".jpeg", ".png", ".webp"]):
                image_url = url
                break

        # Use Groq to extract structured data
        client = Groq(api_key=groq_key)
        extraction_prompt = f"""Extract restaurant details from the search results below for "{req.name}" in {req.city}.
Return ONLY a valid JSON object with these exact keys (use null if not found):
{{
  "name": string,
  "cuisine_type": string (one of: Italian, Chinese, Mexican, Indian, Japanese, American, Thai, Mediterranean, French, Other),
  "description": string (1-2 sentence description),
  "address": string (street address only, no city/state),
  "city": string,
  "phone": string,
  "hours": string (compact format like "Mon-Fri: 11am-10pm"),
  "price_tier": string (one of: $, $$, $$$, $$$$),
  "amenities": array of strings (e.g. ["Outdoor Seating", "Full Bar", "Reservations"])
}}

Search results:
{search_text[:2000]}"""

        completion = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[{"role": "user", "content": extraction_prompt}],
            temperature=0.1,
            max_tokens=512,
        )

        raw = completion.choices[0].message.content.strip()
        # Extract JSON from response
        start = raw.find('{')
        end = raw.rfind('}') + 1
        if start == -1 or end == 0:
            raise HTTPException(status_code=500, detail="Could not parse AI response.")

        data = json.loads(raw[start:end])
        result = AutofillResponse(**{k: v for k, v in data.items() if v is not None})
        if image_url:
            result.image_url = image_url
        return result

    except HTTPException:
        raise
    except Exception as e:
        print(f"AUTOFILL ERROR: {type(e).__name__}: {e}")
        raise HTTPException(status_code=500, detail="Autofill failed. Please fill in details manually.")

