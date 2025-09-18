# Loan CRM Lite

A modern Customer Relationship Management (CRM) system designed specifically for loan management. This application provides a comprehensive platform for managing loan customers, tracking activities, and generating AI-powered campaign messages.

## Features

- **User Authentication**: Secure login system with JWT tokens
- **Customer Management**: View, search, and filter loan customers
- **Activity Tracking**: Log and track customer interactions
- **AI-Powered Campaigns**: Generate personalized campaign messages using Google's Gemini AI
- **Real-time Dashboard**: Interactive dashboard with customer portfolio overview
- **Responsive Design**: Modern UI built with Tailwind CSS

## Tech Stack

### Backend
- **FastAPI**: Modern, fast web framework for building APIs
- **SQLAlchemy**: SQL toolkit and Object-Relational Mapping (ORM)
- **PostgreSQL**: Robust relational database
- **Alembic**: Database migration tool
- **JWT Authentication**: Secure token-based authentication
- **Google Gemini AI**: AI-powered campaign message generation

### Frontend
- **HTML5/CSS3**: Modern web standards
- **JavaScript (ES6+)**: Interactive functionality
- **jQuery**: DOM manipulation and AJAX requests
- **Tailwind CSS**: Utility-first CSS framework
- **Font Awesome**: Icon library

### Development Tools
- **Python 3.8+**: Programming language
- **Uvicorn**: ASGI server for FastAPI
- **python-dotenv**: Environment variable management

## Libraries and Dependencies

### Backend Dependencies (requirements.txt)
```
fastapi==0.104.1              # Web framework
uvicorn[standard]==0.24.0     # ASGI server
sqlalchemy==2.0.23            # ORM
psycopg2-binary==2.9.9        # PostgreSQL adapter
alembic==1.12.1               # Database migrations
python-jose[cryptography]==3.3.0  # JWT handling
passlib[bcrypt]==1.7.4        # Password hashing
python-multipart==0.0.6       # Form data handling
python-dotenv==1.0.0          # Environment variables
pydantic==2.5.0               # Data validation
pydantic-settings==2.1.0      # Settings management
pydantic[email]==2.5.0        # Email validation
google-generativeai==0.8.5    # Gemini AI integration
```

### Frontend Dependencies (CDN)
```
jQuery 3.7.1                  # DOM manipulation
Tailwind CSS                  # Styling framework
Font Awesome 6.4.0           # Icons
```

## Prerequisites

Before running this application, ensure you have the following installed:

- **Python 3.8 or higher**
- **PostgreSQL 12 or higher**
- **Git** (for cloning the repository)

## Setup Instructions

### 1. Clone the Repository
```bash
git clone <repository-url>
cd loan_crm
```

### 2. Database Setup
1. Install PostgreSQL and create a database:
```sql
CREATE DATABASE loan_crm;
CREATE USER loan_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE loan_crm TO loan_user;
```

### 3. Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Create a virtual environment:
```bash
python3 -m venv venv
```

3. Activate the virtual environment:
```bash
# On Linux/Mac
source venv/bin/activate

# On Windows
venv\Scripts\activate
```

4. Install dependencies:
```bash
pip install -r requirements.txt
```

5. Configure environment variables:
```bash
cp .env.example .env
```

6. Edit the `.env` file with your configuration:
```env
DATABASE_URL=postgresql://loan_user:your_password@localhost:5432/loan_crm
SECRET_KEY=your-super-secret-key-change-this-in-production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=300
GEMINI_API_KEY=your-gemini-api-key-here
```

7. Seed Demo Data:
```bash
python seed_data.py
```

### 4. Frontend Setup

The frontend uses CDN-hosted libraries, so no additional installation is required.

## Running the Application

### 1. Start the Backend Server
```bash
cd backend
source venv/bin/activate  # Activate virtual environment
uvicorn main:app --reload --host 0.0.0.0 --port 8003
```

The backend API will be available at: `http://localhost:8003`

### 2. Start the Frontend Server
```bash
cd frontend
python3 server.py 
```

The frontend will be available at: `http://localhost:8004`

### 3. Access the Application

1. Open your web browser and navigate to `http://localhost:8004`
2. Use the login page to authenticate
3. Use the username `admin` and password `admin123` to login
4. Access the dashboard to manage customers and activities

## API Documentation

Once the backend is running, you can access the interactive API documentation at:
- **Swagger UI**: `http://localhost:8003/docs`
- **ReDoc**: `http://localhost:8003/redoc`

## Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | Required |
| `SECRET_KEY` | JWT secret key | Required |
| `ALGORITHM` | JWT algorithm | HS256 |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | Token expiration time | 300 |
| `GEMINI_API_KEY` | Google Gemini API key | Optional |

### Getting a Gemini API Key

1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key
3. Add it to your `.env` file as `GEMINI_API_KEY`

## Project Structure

```
loan_crm/
├── backend/
│   ├── __pycache__/          # Python cache files
│   ├── venv/                 # Virtual environment
│   ├── .env                  # Environment variables
│   ├── .env.example          # Environment template
│   ├── main.py               # FastAPI application entry point
│   ├── models.py             # Database models
│   ├── schemas.py            # Pydantic schemas
│   ├── database.py           # Database configuration
│   ├── auth.py               # Authentication logic
│   ├── config.py             # Application settings
│   ├── ai_service.py         # AI service integration
│   └── requirements.txt      # Python dependencies
├── frontend/
│   ├── js/
│   │   ├── api.js            # API communication
│   │   ├── auth.js           # Authentication handling
│   │   ├── dashboard.js      # Dashboard functionality
│   │   └── login.js          # Login functionality
│   ├── dashboard.html        # Main dashboard page
│   ├── index.html            # Login page
│   └── server.py             # Frontend development server
└── README.md                 # This file
```

## Development

### Adding New Features

1. **Backend**: Add new endpoints in `main.py`, create models in `models.py`, and schemas in `schemas.py`
2. **Frontend**: Add new JavaScript functionality in the `js/` directory and update HTML templates


## Troubleshooting

### Common Issues

1. **Database Connection Error**
   - Verify PostgreSQL is running
   - Check database credentials in `.env`
   - Ensure database exists

2. **Port Already in Use**
   - Change the port in the run commands
   - Kill existing processes using the ports

3. **AI Service Not Working**
   - Verify `GEMINI_API_KEY` is set correctly
   - Check API key permissions and quotas

4. **Frontend Not Loading**
   - Ensure both frontend and backend servers are running
   - Check browser console for JavaScript errors
   - Verify CORS settings in backend

### Logs and Debugging

- Backend logs are displayed in the terminal where `uvicorn` is running
- Frontend errors can be viewed in the browser's developer console
- Database queries can be debugged by enabling SQLAlchemy logging

### Limitations

- If time allowed I could implement filter with risk score and overdue date
- I could also implement bonus points