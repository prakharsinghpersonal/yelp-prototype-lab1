from db.database import SessionLocal
from models.models import User

def main():
    db = SessionLocal()
    # Find normal user
    users = db.query(User).limit(5).all()
    print("Users found:")
    for u in users:
        print(f"ID: {u.id}, Email: {u.email}, Role: {u.role}")

if __name__ == "__main__":
    main()
