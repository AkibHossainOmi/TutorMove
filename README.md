# Project Setup and Run Guide

## Prerequisites
- Python 3.8 or higher
- Node.js 14 or higher
- MySQL Server (for production)
- Git

## Installation & Setup

### 1. Backend Setup

#### Create and Activate Virtual Environment
```bash
# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate
```

#### Install Python Dependencies
```bash
pip install -r requirements.txt
```

#### Database Setup
```bash
# Create database migrations
python manage.py makemigrations

# Apply migrations to database
python manage.py migrate

# Seed initial data (if applicable)
python manage.py seed_all
```

### 2. Frontend Setup

#### Install Node.js Dependencies
```bash
npm install
```

## Running the Application

### Option 1: Run Both Frontend and Backend Together (Recommended for Development)

#### Start Backend Server
```bash
uvicorn backend.asgi:application --reload
```
Backend will be available at: http://localhost:8000

#### Run Worker
```bash
python manage.py rqworker default
```

#### Start Frontend Development Server (in a new terminal)
```bash
npm start
```
Frontend will be available at: http://localhost:3000

### Option 2: Production Build
```bash
# Create production build of frontend
npm run build

# The built files will be in the 'build' folder
# You can serve them with a static file server or configure Django to serve them
```

## Environment Configuration

### Backend Setup
1. Rename `backend/.env.example` to `backend/.env`
2. Configure these essential settings:
   - Database: Set `DB_ENGINE`, `DB_NAME`, credentials
   - Email: Configure `EMAIL_HOST_USER`, `EMAIL_HOST_PASSWORD`
   - SSLCommerz: Add payment gateway credentials
   - Google OAuth: Set `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`
   - Redis: Configure `REDIS_HOST` and `REDIS_PORT` for caching

### Frontend Setup
1. Rename `frontend/.env.example` to `frontend/.env`
2. Set `REACT_APP_API_URL` to your backend URL (e.g., http://localhost:8000)
3. Configure any other frontend-specific environment variables

For database migration from SQLite to MySQL, refer to [**SQLite to MySQL Migration Guide**](MIGRATION_GUIDE_SQLITE_TO_MYSQL.md)
