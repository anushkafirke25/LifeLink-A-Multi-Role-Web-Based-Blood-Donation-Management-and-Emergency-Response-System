HEAD
/ README.md (Quick Start Guide)

# LifeLink - Blood Donation Management System

A comprehensive MERN stack application for managing blood donations, connecting donors, hospitals, and blood banks.

## Features
- Donor registration and donation tracking
- Hospital blood request management
- Blood bank inventory management
- Real-time emergency requests
- Achievement system for donors
- Dashboard analytics for all users

## Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or Atlas)
- MongoDB Compass (optional, for GUI)

## Installation

### 1. Clone and Setup
```bash
git clone <your-repo-url>
cd lifelink
```

### 2. Backend Setup
```bash
cd server
npm install
cp .env.example .env
# Edit .env with your MongoDB URI
npm run dev
```

### 3. Frontend Setup
```bash
cd client
npm install
cp .env.example .env
# Edit .env with your API URL
npm start
```

### 4. MongoDB Setup
- Open MongoDB Compass
- Connect to: `mongodb://localhost:27017`
- Database will be created automatically on first request

## API Endpoints

### Authentication
- POST /api/auth/register - Register new user
- POST /api/auth/login - Login user
- GET /api/auth/me - Get current user
- PUT /api/auth/profile - Update profile
- PUT /api/auth/change-password - Change password

### Donor
- GET /api/donor/dashboard - Get dashboard data
- GET /api/donor/emergency-requests - Get emergency requests
- POST /api/donor/respond/:id - Respond to request
- GET /api/donor/history - Get donation history
- POST /api/donor/schedule-donation - Schedule donation
- GET /api/donor/achievements - Get achievements

### Hospital
- GET /api/hospital/dashboard - Get dashboard data
- POST /api/hospital/request - Create blood request
- GET /api/hospital/requests - Get all requests
- GET /api/hospital/inventory - Get blood inventory

### Blood Bank
- GET /api/bloodbank/dashboard - Get dashboard data
- GET /api/bloodbank/inventory - Get inventory
- PUT /api/bloodbank/inventory/:bloodType - Update inventory
- GET /api/bloodbank/pending-donors - Get pending donors
- PUT /api/bloodbank/donation/:id/approve - Approve donation
- GET /api/bloodbank/hospital-requests - Get hospital requests
- PUT /api/bloodbank/request/:id/process - Process request

## Testing

### Create Test User
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Donor",
    "email": "donor@test.com",
    "password": "password123",
    "role": "donor",
    "bloodType": "O+",
    "phone": "+91-9876543210"
  }'
```

## Deployment
- Frontend: Vercel, Netlify
- Backend: Heroku, Railway, Render
- Database: MongoDB Atlas

## License
MIT

# LifeLink – Blood Donation Management System

A full-stack web application built on the MERN stack that connects **Donors**, **Hospitals**, and **Blood Banks** on a single platform — enabling real-time blood requests, automated inventory tracking, and location-based facility discovery.

## Overview

LifeLink solves a real coordination problem in blood donation: donors, hospitals, and blood banks typically operate on disconnected, manual systems, making it slow to find available blood in emergencies. LifeLink brings all three parties onto one platform with role-based dashboards, so requests, responses, and inventory updates happen in real time.

## Key Features

- **Role-based authentication** — dedicated dashboards for Donors, Hospitals, and Blood Banks
- **Real-time request system** — automated inventory updates via REST API integration when a request is fulfilled
- **GPS-based facility search** — Haversine formula for distance calculation, with address-based fallback when location access isn't available
- **Automated donor eligibility tracking** — enforces the standard 90-day donation cycle and schedules next-eligible-date logic
- **Dynamic certificate generation** — auto-generated donation certificates for donors
- **Multilingual support** — improves accessibility across user groups
- **Campaign management module** — enables blood donation drives and awareness campaigns

## Tech Stack

- **Frontend:** React.js
- **Backend:** Node.js, Express.js
- **Database:** MongoDB
- **APIs:** REST API architecture
- **Other:** Haversine formula (geolocation), JWT-based auth (if used — adjust if different)

