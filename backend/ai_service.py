import google.generativeai as genai
from typing import List, Optional
from config import settings
from models import Customer,Campaign

class AIService:
    def __init__(self):
        self.model = None
        if settings.gemini_api_key:
            try:
                genai.configure(api_key=settings.gemini_api_key)
                self.model = genai.GenerativeModel('gemini-2.0-flash-exp')
            except Exception as e:
                print(f"Gemini client initialization failed: {e}")
                self.model = None
    
    def generate_campaign_message(self, customer: Customer) -> str:
        """Generate AI-powered campaign message for a customer"""
        
        print("in line number 20",self.model)
        if not self.model:
            return "please provide gemini model"
        
        try:
            customer_context = self._prepare_customer_context(customer)
            
            prompt = self._create_campaign_prompt(customer_context)
            
            # Generate content using Gemini
            response = self.model.generate_content(prompt)
            
            return response.text.strip()
            
        except Exception as e:
            print(f"AI service error: {e}")

    def _prepare_customer_context(self, customer: Customer) -> str:
        """Prepare customer data for AI prompt"""
        
        loan_amount = f"${customer.loan_amount:,.2f}" if customer.loan_amount else 'N/A'
        outstanding_balance = f"${customer.outstanding_balance:,.2f}" if customer.outstanding_balance else 'N/A'
        monthly_payment = f"${customer.monthly_payment:,.2f}" if customer.monthly_payment else 'N/A'
        risk_score = customer.risk_score if customer.risk_score else 'N/A'
        overdue_days = customer.overdue_days if customer.overdue_days else 0
        
        # Determine risk category for better context
        risk_category = "N/A"
        if customer.risk_score:
            if customer.risk_score >= 80:
                risk_category = "Low Risk (Excellent)"
            elif customer.risk_score >= 60:
                risk_category = "Medium Risk (Good)"
            else:
                risk_category = "High Risk (Needs Attention)"
        
        customer_info = f"""
    Customer: {customer.first_name} {customer.last_name}
    Loan Status: {customer.loan_status}
    Loan Amount: {loan_amount}
    Outstanding Balance: {outstanding_balance}
    Monthly Payment: {monthly_payment}
    Risk Score: {risk_score}/100 ({risk_category})
    Overdue Days: {overdue_days}
    """
        return customer_info.strip()

    
    def _create_campaign_prompt(self, customer_context: str) -> str:
        """Create AI prompt for campaign generation"""
        
        base_prompt = f"""You are a professional loan officer creating personalized campaign text for customer.

Create a personalized, descriptive campaign text for the following customer:

{customer_context}

Requirements:
- Start the message directly with the greeting like "Hi [Customer Name],..."
- Professional and friendly tone
- Personalized based on customer's loan status, risk score, and overdue status
- For Low Risk customers: Focus on benefits, rewards, or new opportunities
- For Medium Risk customers: Provide helpful tips and support resources
- For High Risk customers: Offer assistance, payment plans, or restructuring options
- If customer has overdue payments: Address this sensitively with support options
- Include relevant offers or recommendations based on risk profile
- Keep it concise and actionable
- Focus on value proposition for the customer
- Format as simple descriptive text
- Direct and conversational tone
"""
        
        return base_prompt