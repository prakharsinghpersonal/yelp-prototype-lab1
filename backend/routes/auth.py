"""Authentication routes - Login, signup, and JWT token management"""
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

# Import our database tools, models, schemas, and auth services
from db.database import get_db
from models.models import User
from models.schemas import SignupRequest, LoginRequest, TokenResponse
from services.auth import hash_password, verify_password, create_access_token

# Create an APIRouter.
# This groups all "/auth" endpoints together so our main.py stays clean.
router = APIRouter(prefix="/auth", tags=["Authentication"])


# The POST endpoint for "/auth/signup"
@router.post("/signup", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
def signup(req: SignupRequest, db: Session = Depends(get_db)):
    """
    Register a new user and return a JWT access token.
    """
    # 1. Check if the email already exists in the database
    # .first() gets the first matching record (or None if not found)
    existing_user = db.query(User).filter(User.email == req.email).first()
    if existing_user:
        # If the email is found, throw an error back to the frontend
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
        
    # 2. Hash their password so it's secure
    secured_password = hash_password(req.password)
    
    # 3. Create the User object (using kwargs trick or explicitly)
    new_user = User(
        name=req.name,
        email=req.email,
        password_hash=secured_password,
        phone=req.phone,
        role=req.role
    )
    
    # 4. Save the new user to the database
    db.add(new_user)
    db.commit()
    
    # Refresh loads the generated ID (and other DB defaults) back into the Python object
    db.refresh(new_user)
    
    # 5. Create a JWT token for the user so they are instantly logged in
    # We embed their "sub" (subject, usually identifying info) inside the token
    token = create_access_token(data={"sub": str(new_user.id)})
    
    # Return the token to the frontend
    return {"access_token": token, "token_type": "bearer"}


# The POST endpoint for "/auth/login"
# Notice we changed req: LoginRequest to form_data: OAuth2PasswordRequestForm = Depends()
@router.post("/login", response_model=TokenResponse)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    """
    Authenticate a user and return a JWT access token.
    (Takes form data so Swagger UI's Authorize button works!)
    """
    # 1. Look up the user by email (Swagger's form calls it 'username', but we map it to our 'email')
    user = db.query(User).filter(User.email == form_data.username).first()
    
    # 2. Check if the user exists AND if the password matches the hash
    if not user or not verify_password(form_data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
        
    # 3. If everything is correct, create a new JWT token
    token = create_access_token(data={"sub": str(user.id)})
    
    return {"access_token": token, "token_type": "bearer"}
