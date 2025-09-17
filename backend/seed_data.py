from sqlalchemy.orm import Session
from database import SessionLocal, engine
from models import Base, User
from auth import get_password_hash
import random
from datetime import datetime, timedelta

# Create tables
Base.metadata.create_all(bind=engine)

def create_demo_data():
    db = SessionLocal()
    
    try:
        existing_user = db.query(User).filter(User.username == "admin").first()
        if existing_user:
            print("Demo user already exists, skipping user creation")
            demo_user = existing_user
        else:
            # Create demo user
            demo_user = User(
                username="admin",
                hashed_password=get_password_hash("admin123"),
                email="admin@loancrm.com",
                full_name="Admin User",
                is_active=True
            )
            db.add(demo_user)
            db.commit()
            db.refresh(demo_user)
        
        print("Demo user created successfully!")
        
    except Exception as e:
        print(f"Error creating demo data: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    create_demo_data()
