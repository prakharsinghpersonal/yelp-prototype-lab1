from db.database import SessionLocal
from models.models import User
from services.auth import hash_password

def main():
    db = SessionLocal()
    pwd = hash_password("Password123!")
    
    u1 = db.query(User).filter(User.email=="prakhar@demo.com").first()
    if u1:
        u1.password_hash = pwd
        print("Updated prakhar@demo.com")

    u2 = db.query(User).filter(User.email=="nikhil@demo.com").first()
    if u2:
        u2.password_hash = pwd
        u2.role = "owner"
        print("Updated nikhil@demo.com and set as owner")

    db.commit()

if __name__ == "__main__":
    main()
