"""AI Chat routes - Restaurant recommendations via Agentic AI (Gemini + Tavily)"""
import os
import json
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from db.database import get_db
from models.models import User, Restaurant, UserPreference
from models.schemas import AIChatRequest, AIChatResponse, RestaurantBrief
from services.auth import get_current_user

from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_community.tools.tavily_search import TavilySearchResults
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.messages import SystemMessage, HumanMessage, AIMessage

router = APIRouter(prefix="/ai-assistant", tags=["AI Assistant"])

@router.post("/chat", response_model=AIChatResponse)
def chat_with_ai(
    req: AIChatRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Agentic AI chat - uses Gemini and LangChain to recommend restaurants
    based on user preferences, local database, and Tavily web search.
    """
    try:
        # 1. Fetch User Preferences
        prefs = db.query(UserPreference).filter(UserPreference.user_id == current_user.id).first()
        prefs_dict = {}
        if prefs:
            prefs_dict = {
                "cuisines": prefs.cuisines,
                "price_range": prefs.price_range,
                "preferred_locations": prefs.preferred_locations,
                "dietary_needs": prefs.dietary_needs,
                "ambiance": prefs.ambiance,
                "sort_preference": prefs.sort_preference
            }
        
        # 2. Fetch all restaurants from DB (since small prototype, we filter via LLM context)
        restaurants = db.query(Restaurant).all()
        db_restaurants = [
            {
                "id": r.id,
                "name": r.name,
                "cuisine_type": r.cuisine_type,
                "price_tier": r.price_tier,
                "city": r.city,
                "avg_rating": r.avg_rating,
                "amenities": r.amenities,
                "description": r.description
            }
            for r in restaurants
        ]
        
        # 3. Use Tavily for real-time web context
        web_context = "No web context available."
        try:
            tavily = TavilySearchResults(max_results=3)
            search_results = tavily.invoke({"query": f"restaurants {req.message}"})
            web_context = json.dumps(search_results)
        except Exception as e:
            print(f"Tavily search failed: {e}")
            pass
            
        # 4. Initialize LangChain Gemini model with structured output
        api_key = os.getenv("GOOGLE_API_KEY")
        if not api_key:
            raise HTTPException(status_code=500, detail="Gemini API key not configured")
            
        llm = ChatGoogleGenerativeAI(
            model="gemini-2.0-flash",
            google_api_key=api_key,
            temperature=0.7
        )
        structured_llm = llm.with_structured_output(AIChatResponse)
        
        # 5. Build the prompt
        system_prompt = f"""You are a helpful, conversational restaurant assistant for Yelp Prototype.
        
User Preferences:
{json.dumps(prefs_dict)}

Local Database of Valid Restaurants:
{json.dumps(db_restaurants)}

Recent Web Search Context (from Tavily):
{web_context}

INSTRUCTIONS:
1. Analyze the user's latest query against their preferences. If the query conflicts with a preference (e.g. they want "$$$" but preference is "$"), follow the query.
2. Select 1 to 4 of the BEST matching restaurants from the Local Database. You MUST ONLY recommend restaurants that exist in the Local Database.
3. Use the Web Search Context to add realistic flair to your response (e.g., mentioning trending spots, local vibe, or general info), but the final recommendations MUST be from the local DB.
4. Provide a conversational, helpful 'response' string explaining your choices. Make it feel natural and conversational.
5. Provide the 'restaurants' array, filling out the required fields for each selected restaurant, including a specific 'reason' why it was chosen.
"""

        messages = [SystemMessage(content=system_prompt)]
        
        # Add conversation history
        for msg in req.conversation_history:
            if msg.role == "user":
                messages.append(HumanMessage(content=msg.content))
            else:
                messages.append(AIMessage(content=msg.content))
                
        # Add current message
        messages.append(HumanMessage(content=req.message))
        
        # 6. Call the model
        result = structured_llm.invoke(messages)
        return result
        
    except Exception as e:
        print(f"AI Chat Error: {e}")
        return AIChatResponse(
            response="I'm having trouble connecting to my AI brain right now. Please try again later.",
            restaurants=[]
        )

