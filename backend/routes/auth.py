from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

# Import our database tools, models, schemas, and auth services
from db.database import get_db
from models.models import User
from models.schemas import SignupRequest, OwnerSignupRequest, LoginRequest, TokenResponse
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
        city=req.city,
        state=req.state,
        country=req.country,
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
@router.post("/login", response_model=TokenResponse)
def login(req: LoginRequest, db: Session = Depends(get_db)):
    """
    Authenticate a user and return a JWT access token.
    (Changed to JSON request body to avoid python-multipart hangs)
    """
    # 1. Look up the user by email
    user = db.query(User).filter(User.email == req.email).first()
    
    # 2. Check if the user exists AND if the password matches the hash
    if not user or not verify_password(req.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
        
    # 3. If everything is correct, create a new JWT token
    token = create_access_token(data={"sub": str(user.id)})
    
    return {"access_token": token, "token_type": "bearer"}


# The POST endpoint for "/auth/owner/signup"
@router.post("/owner/signup", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
def owner_signup(req: OwnerSignupRequest, db: Session = Depends(get_db)):
    """
    Register a new restaurant owner and return a JWT access token.
    """
    existing_user = db.query(User).filter(User.email == req.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
        
    secured_password = hash_password(req.password)
    
    # We forcefully set role to 'owner'
    new_user = User(
        name=req.name,
        email=req.email,
        password_hash=secured_password,
        phone=req.phone,
        city=req.city,
        state=req.state,
        country=req.country,
        role="owner"
    )
    
    # The restaurant_name and restaurant_location can be optionally logged or 
    # used later when they create a restaurant
    
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    token = create_access_token(data={"sub": str(new_user.id)})
    
    return {"access_token": token, "token_type": "bearer"}


# The POST endpoint for "/auth/owner/login"
@router.post("/owner/login", response_model=TokenResponse)
def owner_login(req: LoginRequest, db: Session = Depends(get_db)):
    """
    Authenticate an owner and return a JWT access token.
    Rejects the login if the user is not an owner.
    """
    user = db.query(User).filter(User.email == req.email).first()
    
    if not user or not verify_password(req.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
        
    if user.role != "owner":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account does not have owner privileges",
            headers={"WWW-Authenticate": "Bearer"},
        )
        
    token = create_access_token(data={"sub": str(user.id)})
    
    return {"access_token": token, "token_type": "bearer"}
