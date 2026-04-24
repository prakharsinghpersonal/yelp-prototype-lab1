import json
import os
import re
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen

from fastapi import APIRouter, Depends, HTTPException
from pymongo.database import Database

from db.database import get_db
from models.schemas import AIChatRequest, AIChatResponse, AutofillRequest, AutofillResponse, RestaurantBrief
from services.auth import get_current_user

router = APIRouter(prefix="/ai-assistant", tags=["AI Assistant"])


def _score_restaurants(message: str, restaurants: list[dict], preference: dict | None = None) -> list[dict]:
    text = (message or "").lower()
    preference = preference or {}
    scored = []
    for restaurant in restaurants:
        score = restaurant.get("avg_rating", 0) * 10 + restaurant.get("review_count", 0)
        cuisine = (restaurant.get("cuisine_type") or "").lower()
        city = (restaurant.get("city") or "").lower()
        description = (restaurant.get("description") or "").lower()
        haystack = " ".join([cuisine, city, description, restaurant.get("name", "").lower()])

        for token in ["spicy", "taco", "mexican", "indian", "japanese", "thai", "italian", "casual", "outdoor", "family"]:
            if token in text and token in haystack:
                score += 15
        if cuisine and cuisine in text:
            score += 20
        if city and city in text:
            score += 12
        if cuisine and cuisine in [item.lower() for item in preference.get("cuisines", [])]:
            score += 10
        if city and city in [item.lower() for item in preference.get("preferred_locations", [])]:
            score += 8
        scored.append((score, restaurant))
    return [restaurant for _, restaurant in sorted(scored, key=lambda item: item[0], reverse=True)]


def _fallback_chat_response(message: str, restaurants: list[dict], preference: dict | None = None) -> AIChatResponse:
    ranked = _score_restaurants(message, restaurants, preference)[:3]
    if not ranked:
        return AIChatResponse(response="I couldn't find a strong match right now, but try browsing the latest restaurants on the explore page.")

    summary = []
    cards = []
    for restaurant in ranked:
        summary.append(
            f"{restaurant['name']} for {restaurant.get('cuisine_type', 'food')} in {restaurant.get('city', 'your area')}"
        )
        cards.append(
            RestaurantBrief(
                id=restaurant["id"],
                name=restaurant["name"],
                cuisine_type=restaurant.get("cuisine_type"),
                city=restaurant.get("city"),
                avg_rating=restaurant.get("avg_rating"),
                price_tier=restaurant.get("price_tier"),
                reason=restaurant.get("description"),
            )
        )
    response = "Try " + ", ".join(summary[:-1] + [summary[-1]]) + "."
    return AIChatResponse(response=response, restaurants=cards)


def _infer_cuisine(search_text: str) -> str | None:
    text = search_text.lower()
    cuisines = [
        "italian",
        "indian",
        "mexican",
        "japanese",
        "thai",
        "chinese",
        "mediterranean",
        "american",
        "french",
    ]
    for cuisine in cuisines:
        if cuisine in text:
            return cuisine.title()
    return None


def _fallback_autofill(req: AutofillRequest, search_text: str, image_url: str | None = None) -> AutofillResponse:
    phone_match = re.search(r"(\+?1?[-.\s]?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4})", search_text)
    hours_match = re.search(r"((Mon|Tue|Wed|Thu|Fri|Sat|Sun)[^\\n]{0,80})", search_text, re.IGNORECASE)
    price_match = re.search(r"(\${1,4})", search_text)
    address_match = re.search(
        r"(\d{1,5}\s+[A-Za-z0-9 .'-]+(?:Street|St|Avenue|Ave|Road|Rd|Boulevard|Blvd|Lane|Ln|Drive|Dr))",
        search_text,
        re.IGNORECASE,
    )

    cleaned_description = re.sub(r"\s+", " ", search_text).strip()
    description = cleaned_description[:220] if cleaned_description else None
    amenities = []
    text = search_text.lower()
    if "outdoor" in text:
        amenities.append("Outdoor Seating")
    if "takeout" in text:
        amenities.append("Takeout")
    if "reservation" in text:
        amenities.append("Reservations")

    return AutofillResponse(
        name=req.name,
        cuisine_type=_infer_cuisine(search_text),
        description=description,
        address=address_match.group(1) if address_match else None,
        city=req.city,
        phone=phone_match.group(1) if phone_match else None,
        hours=hours_match.group(1) if hours_match else None,
        price_tier=price_match.group(1) if price_match else None,
        amenities=amenities,
        image_url=image_url,
    )


def _groq_chat_completion(
    api_key: str,
    messages: list[dict[str, str]],
    *,
    model: str = "llama-3.1-8b-instant",
    temperature: float = 0.7,
    max_tokens: int = 512,
) -> str:
    payload = json.dumps(
        {
            "model": model,
            "messages": messages,
            "temperature": temperature,
            "max_tokens": max_tokens,
        }
    ).encode("utf-8")
    request = Request(
        "https://api.groq.com/openai/v1/chat/completions",
        data=payload,
        headers={
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
        },
        method="POST",
    )
    try:
        with urlopen(request, timeout=25) as response:
            body = json.loads(response.read().decode("utf-8"))
    except HTTPError as exc:
        detail = exc.read().decode("utf-8", errors="ignore")
        raise RuntimeError(f"Groq API HTTP {exc.code}: {detail}") from exc
    except URLError as exc:
        raise RuntimeError(f"Groq API network error: {exc.reason}") from exc

    try:
        return body["choices"][0]["message"]["content"].strip()
    except (KeyError, IndexError, TypeError) as exc:
        raise RuntimeError(f"Unexpected Groq response: {body}") from exc


def _openai_chat_completion(
    api_key: str,
    messages: list[dict[str, str]],
    *,
    base_url: str = "https://api.openai.com/v1",
    model: str = "gpt-4.1-nano",
    temperature: float = 0.7,
    max_tokens: int = 512,
) -> str:
    payload = json.dumps(
        {
            "model": model,
            "messages": messages,
            "temperature": temperature,
            "max_tokens": max_tokens,
        }
    ).encode("utf-8")
    request = Request(
        f"{base_url.rstrip('/')}/chat/completions",
        data=payload,
        headers={
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
        },
        method="POST",
    )
    try:
        with urlopen(request, timeout=25) as response:
            body = json.loads(response.read().decode("utf-8"))
    except HTTPError as exc:
        detail = exc.read().decode("utf-8", errors="ignore")
        raise RuntimeError(f"OpenAI API HTTP {exc.code}: {detail}") from exc
    except URLError as exc:
        raise RuntimeError(f"OpenAI API network error: {exc.reason}") from exc

    try:
        return body["choices"][0]["message"]["content"].strip()
    except (KeyError, IndexError, TypeError) as exc:
        raise RuntimeError(f"Unexpected OpenAI response: {body}") from exc


@router.post("/chat", response_model=AIChatResponse)
def chat_with_ai(req: AIChatRequest, current_user: dict = Depends(get_current_user), db: Database = Depends(get_db)):
    try:
        openai_api_key = os.getenv("OPENAI_API_KEY")
        groq_api_key = os.getenv("GROQ_API_KEY")

        local_restaurants = list(db.restaurants.find().sort("avg_rating", -1))
        if not openai_api_key and not groq_api_key:
            rest_names = ", ".join([restaurant["name"] for restaurant in local_restaurants[:3]]) or "No restaurants"
            return AIChatResponse(response=f"I recommend checking out: {rest_names}. What type of cuisine are you interested in?")

        pref = db.user_preferences.find_one({"user_id": current_user["id"]})
        pref_context = ""
        if pref:
            if pref.get("cuisines"):
                pref_context += f"- Cuisine preferences: {', '.join(pref['cuisines'])}\n"
            if pref.get("price_range"):
                pref_context += f"- Price range: {pref['price_range']}\n"
            if pref.get("dietary_needs"):
                pref_context += f"- Dietary needs: {', '.join(pref['dietary_needs'])}\n"
            if pref.get("ambiance"):
                pref_context += f"- Ambiance: {', '.join(pref['ambiance'])}\n"
            if pref.get("preferred_locations"):
                pref_context += f"- Preferred locations: {', '.join(pref['preferred_locations'])}\n"

        rest_context = ""
        for restaurant in local_restaurants:
            rest_context += (
                f"• [{restaurant['id']}] {restaurant['name']} — {restaurant.get('cuisine_type')}, "
                f"{restaurant.get('price_tier') or '?'}, {restaurant.get('city')}, "
                f"rating: {restaurant.get('avg_rating', 0):.1f}. {restaurant.get('description') or ''}\n"
            )

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

        messages = [{"role": "system", "content": system_prompt}]
        for msg in req.conversation_history:
            role = "user" if msg.role in ["user", "human"] else "assistant"
            messages.append({"role": role, "content": msg.content})
        messages.append({"role": "user", "content": req.message})

        if openai_api_key:
            answer = _openai_chat_completion(
                openai_api_key,
                messages,
                base_url=os.getenv("OPENAI_API_BASE", "https://api.openai.com/v1"),
                model=os.getenv("OPENAI_MODEL", "gpt-4.1-nano"),
                temperature=0.7,
                max_tokens=512,
            )
        else:
            answer = _groq_chat_completion(
                groq_api_key,
                messages,
                model="llama-3.1-8b-instant",
                temperature=0.7,
                max_tokens=512,
            )
        answer_lower = answer.lower()
        mentioned = []
        for restaurant in local_restaurants:
            name_lower = restaurant["name"].lower()
            first_word = name_lower.split()[0] if name_lower.split() else ""
            if name_lower in answer_lower or (len(first_word) >= 4 and first_word in answer_lower):
                mentioned.append(
                    RestaurantBrief(
                        id=restaurant["id"],
                        name=restaurant["name"],
                        cuisine_type=restaurant.get("cuisine_type"),
                        city=restaurant.get("city"),
                        avg_rating=restaurant.get("avg_rating"),
                        price_tier=restaurant.get("price_tier"),
                    )
                )

        return AIChatResponse(response=answer, restaurants=mentioned)
    except HTTPException:
        raise
    except Exception as exc:
        print(f"AI CHAT ERROR: {type(exc).__name__}: {exc}")
        return _fallback_chat_response(req.message, local_restaurants, pref)


@router.post("/autofill", response_model=AutofillResponse)
def autofill_restaurant(req: AutofillRequest, current_user: dict = Depends(get_current_user)):
    try:
        openai_key = os.getenv("OPENAI_API_KEY")
        tavily_key = os.getenv("TAVILY_API_KEY")
        groq_key = os.getenv("GROQ_API_KEY")
        if not tavily_key or (not groq_key and not openai_key):
            raise HTTPException(status_code=503, detail="AI autofill not configured.")

        from tavily import TavilyClient

        tavily = TavilyClient(api_key=tavily_key)
        results = tavily.search(
            query=f"{req.name} restaurant {req.city} hours phone address cuisine price",
            max_results=3,
            include_images=True,
        )

        search_text = ""
        for result in results.get("results", []):
            search_text += f"{result.get('title', '')}\n{result.get('content', '')}\n\n"
        if not search_text.strip():
            raise HTTPException(status_code=404, detail="No information found for this restaurant.")

        image_url = None
        for image in results.get("images", []):
            url = image if isinstance(image, str) else image.get("url", "")
            if any(ext in url.lower() for ext in [".jpg", ".jpeg", ".png", ".webp"]):
                image_url = url
                break

        extraction_prompt = f"""Extract restaurant details from the search results below for "{req.name}" in {req.city}.
Return ONLY a valid JSON object with these exact keys (use null if not found):
{{
  "name": string,
  "cuisine_type": string,
  "description": string,
  "address": string,
  "city": string,
  "state": string,
  "phone": string,
  "hours": string,
  "price_tier": string,
  "amenities": array of strings
}}

Search results:
{search_text[:2000]}"""

        try:
            if openai_key:
                raw = _openai_chat_completion(
                    openai_key,
                    [{"role": "user", "content": extraction_prompt}],
                    base_url=os.getenv("OPENAI_API_BASE", "https://api.openai.com/v1"),
                    model=os.getenv("OPENAI_MODEL", "gpt-4.1-nano"),
                    temperature=0.1,
                    max_tokens=512,
                )
            else:
                raw = _groq_chat_completion(
                    groq_key,
                    [{"role": "user", "content": extraction_prompt}],
                    model="llama-3.1-8b-instant",
                    temperature=0.1,
                    max_tokens=512,
                )
            start = raw.find("{")
            end = raw.rfind("}") + 1
            if start == -1 or end == 0:
                raise ValueError("Could not parse AI response")

            data = json.loads(raw[start:end])
            result = AutofillResponse(**{key: value for key, value in data.items() if value is not None})
            if image_url:
                result.image_url = image_url
            return result
        except Exception as groq_exc:
            print(f"AUTOFILL FALLBACK: {type(groq_exc).__name__}: {groq_exc}")
            return _fallback_autofill(req, search_text, image_url)
    except HTTPException:
        raise
    except Exception as exc:
        print(f"AUTOFILL ERROR: {type(exc).__name__}: {exc}")
        raise HTTPException(status_code=500, detail="Autofill failed. Please fill in details manually.")
