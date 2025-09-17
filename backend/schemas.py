from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime

# User schemas
class UserBase(BaseModel):
    username: str
    email: Optional[EmailStr] = None
    full_name: Optional[str] = None

class UserCreate(UserBase):
    password: str

class User(UserBase):
    id: int
    is_active: bool
    created_at: datetime
    
    class Config:
        from_attributes = True

# Token schemas
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: Optional[str] = None


class CustomerBase(BaseModel):
    first_name: str
    last_name: str
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    loan_amount: Optional[float] = None
    loan_status: Optional[str] = None
    interest_rate: Optional[float] = None
    loan_term_months: Optional[int] = None
    monthly_payment: Optional[float] = None
    outstanding_balance: Optional[float] = None

class Customer(CustomerBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True


class ActivityBase(BaseModel):
    activity_type: str
    subject: Optional[str] = None
    description: Optional[str] = None

class ActivityCreate(ActivityBase):
    customer_id: int

class Activity(ActivityBase):
    id: int
    customer_id: int
    user_id: int
    created_at: datetime
    
    class Config:
        from_attributes = True

class CampaignRequest(BaseModel):
    customer_id: int

class Campaign(BaseModel):
    id: int
    customer_id: int
    message: str
    user_id: int
    generated_by_ai: bool
    created_at: datetime
    subject: Optional[str] = None
    
    class Config:
        from_attributes = True