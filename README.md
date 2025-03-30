# Semester 4 Course project: A Web-app to book vehicle rides

## Overview
The **Vehicle Booking Service** is a **web-based application** that allows users to book rides with drivers.

## Features
- **User Authentication:** Passengers and drivers can create accounts and log in.
- **Ride Booking:** Passengers can select pickup and drop-off locations, choose vehicle types, and confirm bookings.
- **Real-time Tracking:** Live GPS tracking of drivers and estimated time of arrival (ETA) display.
- **Secure Payments:** Integration with **Razorpay** for online transactions.
- **Driver Dashboard:** Allows drivers to accept or decline ride requests and view earnings.
- **Admin Panel:** Monitoring of user accounts and ride history.
- **User Ratings & Reviews:** Passengers and drivers can rate each other after trips.

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
Ensure that these are installed:
- **Node.js** (v18+)
- **NPM** (or **Yarn**)
- **MySQL**
  
### Clone the Repository
```bash
git clone https://github.com/R2D2-08/bookvehicles.git
cd bookvehicles
```

### Install Dependencies
```bash
npm install
```

### Set Up Environment Variables
Create a `.env` file in the root directory and configure the following:
```env
DATABASE_URL="database-url"
RAZORPAY_KEY_ID="razorpay-key"
JWT_SECRET="secret-key"
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

## Contributors
- [Nishanth](https://github.com/1-Nishanth-1)
- [Sreehari](https://github.com/SreehariSanjeev04)
- [Sahil](https://github.com/Sahil-Muhammed)
- [Omar](https://github.com/R2D2-08)
