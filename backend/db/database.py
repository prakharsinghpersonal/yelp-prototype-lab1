import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from dotenv import load_dotenv

# Load environment variables from the .env file
load_dotenv()

# Get the database URL from the environment variables.
# We expect something like: mysql+pymysql://root:password@localhost:3306/yelp_db
SQLALCHEMY_DATABASE_URL = os.getenv("DATABASE_URL")

# Create the SQLAlchemy "Engine"
# The engine is the starting point for any SQLAlchemy application.
# It acts as a central source of connections to a particular database,
# providing both a factory and a connection pool.
engine = create_engine(SQLALCHEMY_DATABASE_URL)

# Create a "SessionLocal" class
# Each instance of this class will be a database session.
# The class itself is not a database session yet.
# We use autocommit=False and autoflush=False to have more manual control over when data is saved.
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Create a Base class
# Later, we will inherit from this class to create each of the database models or classes (the ORM models)
Base = declarative_base()

# Dependency to get the database session
# We will use this function in our FastAPI routes to provide a database session
# for a single request, and then close it once the request is finished.
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
