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
