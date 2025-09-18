from sqlalchemy.orm import Session
from database import SessionLocal, engine
from models import Base, User, Customer
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
        
        existing_customers = db.query(Customer).first()
        if existing_customers:
            print("Customers already exist")
        else:
            customers_data = [
            {
                "first_name": "John", "last_name": "Smith", "email": "john.smith@email.com",
                "phone": "+1-555-0101", "loan_amount": 250000, "loan_status": "active",
                "risk_score": 75, "overdue_days": 0, "interest_rate": 4.5,
                "loan_term_months": 360, "monthly_payment": 1266.71, "outstanding_balance": 235000
            },
            {
                "first_name": "Sarah", "last_name": "Johnson", "email": "sarah.johnson@email.com",
                "phone": "+1-555-0102", "loan_amount": 180000, "loan_status": "active",
                "risk_score": 82, "overdue_days": 15, "interest_rate": 4.2,
                "loan_term_months": 300, "monthly_payment": 1089.45, "outstanding_balance": 165000
            },
            {
                "first_name": "Michael", "last_name": "Brown", "email": "michael.brown@email.com",
                "phone": "+1-555-0103", "loan_amount": 320000, "loan_status": "pending",
                "risk_score": 68, "overdue_days": 0, "interest_rate": 4.8,
                "loan_term_months": 360, "monthly_payment": 1686.42, "outstanding_balance": 320000
            },
            {
                "first_name": "Emily", "last_name": "Davis", "email": "emily.davis@email.com",
                "phone": "+1-555-0104", "loan_amount": 150000, "loan_status": "approved",
                "risk_score": 88, "overdue_days": 0, "interest_rate": 3.9,
                "loan_term_months": 240, "monthly_payment": 1087.65, "outstanding_balance": 150000
            },
            {
                "first_name": "David", "last_name": "Wilson", "email": "david.wilson@email.com",
                "phone": "+1-555-0105", "loan_amount": 275000, "loan_status": "active",
                "risk_score": 45, "overdue_days": 45, "interest_rate": 5.2,
                "loan_term_months": 360, "monthly_payment": 1512.89, "outstanding_balance": 268000
            },
            {
                "first_name": "Lisa", "last_name": "Anderson", "email": "lisa.anderson@email.com",
                "phone": "+1-555-0106", "loan_amount": 195000, "loan_status": "active",
                "risk_score": 91, "overdue_days": 0, "interest_rate": 3.8,
                "loan_term_months": 300, "monthly_payment": 1145.32, "outstanding_balance": 175000
            },
            {
                "first_name": "Robert", "last_name": "Taylor", "email": "robert.taylor@email.com",
                "phone": "+1-555-0107", "loan_amount": 420000, "loan_status": "rejected",
                "risk_score": 35, "overdue_days": 0, "interest_rate": 0,
                "loan_term_months": 0, "monthly_payment": 0, "outstanding_balance": 0
            },
            {
                "first_name": "Jennifer", "last_name": "Martinez", "email": "jennifer.martinez@email.com",
                "phone": "+1-555-0108", "loan_amount": 225000, "loan_status": "active",
                "risk_score": 79, "overdue_days": 5, "interest_rate": 4.3,
                "loan_term_months": 360, "monthly_payment": 1115.55, "outstanding_balance": 210000
            },
            {
                "first_name": "Christopher", "last_name": "Garcia", "email": "christopher.garcia@email.com",
                "phone": "+1-555-0109", "loan_amount": 165000, "loan_status": "closed",
                "risk_score": 85, "overdue_days": 0, "interest_rate": 4.1,
                "loan_term_months": 240, "monthly_payment": 0, "outstanding_balance": 0
            },
            {
                "first_name": "Amanda", "last_name": "Rodriguez", "email": "amanda.rodriguez@email.com",
                "phone": "+1-555-0110", "loan_amount": 290000, "loan_status": "pending",
                "risk_score": 72, "overdue_days": 0, "interest_rate": 4.6,
                "loan_term_months": 360, "monthly_payment": 1486.69, "outstanding_balance": 290000
            }
        ]
            
            customers = []
            for customer_data in customers_data:
                customer = Customer(**customer_data)
                db.add(customer)
                customers.append(customer)
            
            db.commit()
            print("Demo customers created successfully!")
        
    except Exception as e:
        print(f"Error creating demo data: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    create_demo_data()
