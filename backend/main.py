from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from datetime import timedelta
from typing import List, Optional

from database import get_db, engine
from models import Base, User, Customer, Activity
from schemas import (
    User as UserSchema, UserCreate, Token, Customer as CustomerSchema, ActivityCreate, Activity as ActivitySchema
)
from auth import (
    authenticate_user, create_access_token, get_current_active_user,
    get_password_hash
)
from config import settings

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Loan CRM Lite", version="1.0.0")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/login", response_model=Token)
async def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = authenticate_user(db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=settings.access_token_expire_minutes)
    access_token = create_access_token(
        data={"sub": user.username}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@app.get("/current_user", response_model=UserSchema)
async def get_current_user(current_user: User = Depends(get_current_active_user)):
    return current_user

@app.get("/customers", response_model=List[CustomerSchema])
async def get_customers(
    skip: int = 0, 
    limit: int = 100,
    search: Optional[str] = None,
    loan_status: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    query = db.query(Customer)
    
    # Apply filters
    if search:
        search_term = search.strip()
        if search_term:
            query = query.filter(
                (Customer.first_name.ilike(f"%{search_term}%")) |
                (Customer.last_name.ilike(f"%{search_term}%")) |
                (Customer.email.ilike(f"%{search_term}%"))
            )
    
    if loan_status:
        query = query.filter(Customer.loan_status == loan_status)
    
    return query.offset(skip).limit(limit).all()

@app.get("/customers/{customer_id}", response_model=CustomerSchema)
async def get_customer(
    customer_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    customer = db.query(Customer).filter(Customer.id == customer_id).first()
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    return customer

@app.get("/customers/{customer_id}/activities", response_model=List[ActivitySchema])
async def get_customer_activities(
    customer_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    return db.query(Activity).filter(Activity.customer_id == customer_id).order_by(Activity.created_at.desc()).all()

@app.post("/activities", response_model=ActivitySchema)
async def create_activity(
    activity: ActivityCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    db_activity = Activity(**activity.dict(), user_id=current_user.id)
    db.add(db_activity)
    db.commit()
    db.refresh(db_activity)
    return db_activity

@app.get("/")
async def root():
    return {"message": "Loan CRM API"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}
