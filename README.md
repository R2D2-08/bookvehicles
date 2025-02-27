# Semester 4 Course project: A Web-app to book vehicle rides

## Overview
The **Vehicle Booking Service** is a **web-based application** that allows users to book rides with drivers. The platform provides seamless transport facilities by connecting passengers with drivers while managing ride requests, payments, and real-time tracking.

## Features
- **User Authentication:** Passengers and drivers can create accounts and log in.
- **Ride Booking:** Passengers can select pickup and drop-off locations, choose vehicle types, and confirm bookings.
- **Real-time Tracking:** Live GPS tracking of drivers and estimated time of arrival (ETA) display.
- **Fare Calculation:** Dynamic pricing based on distance, traffic, and environmental conditions.
- **Secure Payments:** Integration with **Razorpay** for online transactions.
- **Driver Dashboard:** Allows drivers to accept or decline ride requests and view earnings.
- **Admin Panel:** Monitoring of user accounts and ride history.
- **User Ratings & Reviews:** Passengers and drivers can rate each other after trips.
- **Emergency SOS Button:** For passenger and driver safety.

## Tech Stack
| Component       | Technology |
|---------------|------------|
| **Frontend** | Next.js (React.js) |
| **Backend** | Node.js with Express.js |
| **Database** | SQL (PostgreSQL/MySQL) |
| **Deployment** | Vercel & Azure |
| **Payment Integration** | Razorpay |
| **Mapping API** | Google Maps API |

## Installation & Setup
### Prerequisites
Ensure you have the following installed:
- **Node.js** (v18+)
- **NPM** (or **Yarn**)
- **SQL Database (PostgreSQL/MySQL)**
- **Vercel CLI** (for deployment)

### Clone the Repository
```bash
git clone https://github.com/YOUR_GITHUB_USERNAME/vehicle-booking-service.git
cd vehicle-booking-service
```

### Install Dependencies
```bash
npm install
```

### Set Up Environment Variables
Create a `.env` file in the root directory and configure the following:
```env
DATABASE_URL="your-database-url"
RAZORPAY_KEY_ID="your-razorpay-key"
RAZORPAY_KEY_SECRET="your-razorpay-secret"
GOOGLE_MAPS_API_KEY="your-google-maps-api-key"
JWT_SECRET="your-secret-key"
```

### Run the Application
#### Development Mode
```bash
npm run dev
```
#### Production Mode
```bash
npm run build
npm start
```

## API Endpoints
### **User Authentication**
| Method | Endpoint | Description |
|--------|------------|-------------|
| POST | `/api/auth/register` | Register a new user |
| POST | `/api/auth/login` | User login |
| POST | `/api/auth/logout` | User logout |

### **Ride Management**
| Method | Endpoint | Description |
|--------|------------|-------------|
| POST | `/api/rides/book` | Book a ride |
| GET | `/api/rides/:id` | Get ride details |
| POST | `/api/rides/cancel/:id` | Cancel a ride |

### **Driver Operations**
| Method | Endpoint | Description |
|--------|------------|-------------|
| POST | `/api/driver/accept/:rideId` | Accept a ride request |
| GET | `/api/driver/history` | View past rides |

## Deployment
### Deploy to Vercel
```bash
vercel deploy
```

## Contributors
- [Nishanth](https://github.com/1-Nishanth-1)
- [Sreehari](https://github.com/SreehariSanjeev04)
- [Sahil](https://github.com/Sahil-Muhammed)
- [Omar](https://github.com/R2D2-08)
