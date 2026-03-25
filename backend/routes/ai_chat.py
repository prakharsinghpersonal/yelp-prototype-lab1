import os
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from db.database import get_db
from models.models import User, Restaurant
from models.schemas import AIChatRequest, AIChatResponse
from services.auth import get_current_user

from langchain_google_genai import ChatGoogleGenerativeAI

router = APIRouter(prefix="/ai-assistant", tags=["AI Assistant"])

@router.post("/chat", response_model=AIChatResponse)
def chat_with_ai(
    req: AIChatRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    AI chat endpoint powered by Gemini.
    Returns restaurant recommendations based on user query.
    """
    try:
        google_api_key = os.getenv("GOOGLE_API_KEY")
        
        if not google_api_key:
            # Test mode - return hardcoded response if no API key
            restaurants = db.query(Restaurant).limit(3).all()
            rest_names = ", ".join([r.name for r in restaurants]) if restaurants else "No restaurants"
            return AIChatResponse(
                response=f"I recommend checking out: {rest_names}. What type of cuisine are you interested in?"
            )
        
        try:
            # Try with the newest model first
            llm = ChatGoogleGenerativeAI(
                model="gemini-2.0-flash-exp",
                google_api_key=google_api_key,
                timeout=20
            )
        except:
            # Fallback to older model
            try:
                llm = ChatGoogleGenerativeAI(
                    model="gemini-pro",
                    google_api_key=google_api_key,
                    timeout=20
                )
            except:
                # Ultimate fallback - return hardcoded response
                restaurants = db.query(Restaurant).limit(3).all()
                rest_names = ", ".join([r.name for r in restaurants]) if restaurants else "No restaurants"
                return AIChatResponse(
                    response=f"I recommend: {rest_names}. Tell me more about your preferences!"
                )
        
        # Build restaurant context
        local_restaurants = db.query(Restaurant).limit(8).all()
        rest_context = ""
        if local_restaurants:
            for r in local_restaurants:
                rest_context += f"• {r.name} - {r.cuisine_type} (${r.price_tier}) in {r.city}\n"
        else:
            rest_context = "No restaurants available yet"

        # System prompt
        system_prompt = f"""You are a friendly restaurant discovery assistant. Help users find great places to eat.

Available restaurants:
{rest_context}

Respond naturally to their queries. Recommend from the local database when relevant. Keep responses concise and friendly."""

        # Build messages
        messages = [
            {"role": "user", "content": system_prompt},
            {"role": "user", "content": req.message}
        ]
        
        # Add conversation history
        for msg in req.conversation_history:
            role = "user" if msg.role in ["user", "human"] else "assistant"
            messages[-1:] = [{"role": role, "content": msg.content}] + [messages[-1]]
        
        # Call LLM
        response = llm.invoke(messages)
        answer = response.content if hasattr(response, 'content') else str(response)
        
        if not answer:
            answer = "I'm here to help you find great restaurants! What are you looking for?"

        return AIChatResponse(response=answer)
        
    except HTTPException:
        raise
    except Exception as e:
        # Graceful fallback
        restaurants = db.query(Restaurant).limit(2).all()
        if restaurants:
            rest_list = ", ".join([r.name for r in restaurants])
            return AIChatResponse(response=f"Try visiting: {rest_list}")
        return AIChatResponse(response="I encountered an issue. Please try again later.")

