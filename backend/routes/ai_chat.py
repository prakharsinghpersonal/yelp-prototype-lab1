"""AI Chat routes - Restaurant recommendations via simple database queries"""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from db.database import get_db
from models.models import User, Restaurant
from models.schemas import AIChatRequest, AIChatResponse
from services.auth import get_current_user

router = APIRouter(prefix="/ai-assistant", tags=["AI Assistant"])

@router.post("/chat", response_model=AIChatResponse)
def chat_with_ai(
    req: AIChatRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Simple AI chat - returns restaurants from database
    """
    try:
        # Get all restaurants
        restaurants = db.query(Restaurant).limit(5).all()
        
        if not restaurants:
            return AIChatResponse(response="No restaurants found in our database yet.")
        
        # Build response
        text = f"Based on your query '{req.message}', here are our top recommendations:\n\n"
        for r in restaurants:
            text += f"• **{r.name}** - {r.cuisine_type} (${r.price_tier}) in {r.city}\n"
        
        text += f"\nWould you like to know more about any of these restaurants?"
        
        return AIChatResponse(response=text)
        
    except Exception as e:
        return AIChatResponse(response="I'm having trouble right now, please try again later.")

