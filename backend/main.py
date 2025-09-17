from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from datetime import timedelta
from typing import List, Optional

from database import get_db, engine
from models import Base, User
from schemas import (
    User as UserSchema, UserCreate, Token
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

@app.get("/")
async def root():
    return {"message": "Loan CRM API"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}
