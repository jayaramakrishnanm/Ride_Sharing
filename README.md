# Ride Sharing System (Car & Bike)
### MCA Academic Project - Frontend-Only Web Application

A modern, responsive, frontend-only Web-Based Ride Sharing System for **Car and Bike rides** built strictly with **Next.js (App Router)**, **React**, **HTML5**, **CSS3 / Tailwind CSS**, and **LocalStorage / SessionStorage** data persistence.

---

## 🌟 Key Features

### 1. Multi-Role Architecture
- **Passenger / User Hub**: Instant booking with dynamic fare calculation, active trip GPS simulator, ride history, and digital invoice generation.
- **Driver Partner Console**: Online/Offline toggle, incoming ride request queue, ride lifecycle step progression (Arrived at Pickup ➔ Start Ride with OTP ➔ Complete Ride ➔ Collect Payment), and earnings summary.
- **Administrator Portal**: Executive metrics, interactive SVG analytics charts, full User CRUD, Driver CRUD, Ride Master Dispatch, CSV data export, and 1-Click database reset.

### 2. Pure Frontend Data Layer
- **No external backend server** (No MongoDB, MySQL, Firebase, Node APIs, PHP, or Python needed).
- **LocalStorage Database**: Persistent storage for `users`, `drivers`, `rides`, `payments`, and `notifications`.
- **SessionStorage Session**: Holds the active logged-in user profile.
- **Reactive Custom Event Bus**: All CRUD operations dispatch real-time events across components and browser tabs.

### 3. Dynamic Fare Calculation Engine
- **City Car**: Base Fare ₹50 + ₹15/km
- **Swift Bike**: Base Fare ₹30 + ₹8/km
- Built-in metro distance matrix with realistic travel times.

### 4. Interactive Simulation Tools
- **Simulated GPS Navigation Map**: Vector SVG map with animated vehicle progression, speed/ETA meter, and pickup/drop markers.
- **Payment Gateway Simulation**: Interactive modal supporting UPI (with QR code), Credit/Debit Card, and Cash with confetti animation.
- **4-Digit Safety OTP Verification**: Passenger provides OTP to driver before ride can start.
- **Driver 5-Star Reviews & Feedback**: Passengers rate trips, saved directly to driver records.

---

## 🛠️ Technology Stack

- **Framework**: Next.js 14 (App Router)
- **UI Library**: React 18 / 19
- **Styling**: Tailwind CSS, PostCSS, Glassmorphism
- **Icons**: Lucide React
- **Animations**: Canvas Confetti & CSS3 Keyframes
- **Persistence**: Browser LocalStorage & SessionStorage + JSON seed datasets

---

## 📂 Project Structure

```
d:\Ride_Sharing
├── package.json
├── tsconfig.json
├── tailwind.config.js
├── postcss.config.js
├── next.config.mjs
├── src
│   ├── app
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   ├── page.tsx                 # Landing Page with Fare Calculator
│   │   ├── login/page.tsx           # Multi-role Login + 1-Click Demo Switcher
│   │   ├── register/page.tsx        # Registration with Passenger/Driver toggle
│   │   ├── user
│   │   │   ├── layout.tsx
│   │   │   ├── dashboard/page.tsx   # Passenger Dashboard Overview
│   │   │   ├── book-ride/page.tsx   # Ride Booking Form & Live Fare Calc
│   │   │   ├── rides/page.tsx       # Live Active Ride GPS Tracker
│   │   │   ├── history/page.tsx     # Past Rides, Filters & Invoices
│   │   │   └── profile/page.tsx     # User Profile & Emergency Contact
│   │   ├── driver
│   │   │   ├── layout.tsx
│   │   │   ├── dashboard/page.tsx   # Driver Dashboard & Online Toggle
│   │   │   ├── requests/page.tsx    # Incoming Pending Requests Queue
│   │   │   ├── active-ride/page.tsx # Trip Lifecycle Progress & OTP verify
│   │   │   ├── history/page.tsx     # Completed Trips & Payouts
│   │   │   └── profile/page.tsx     # Vehicle Specs & License Info
│   │   └── admin
│   │       ├── layout.tsx
│   │       ├── dashboard/page.tsx   # Executive KPIs & Interactive Charts
│   │       ├── users/page.tsx       # User CRUD Management
│   │       ├── drivers/page.tsx     # Driver CRUD Management
│   │       ├── rides/page.tsx       # Master Ride Management & Status Override
│   │       └── reports/page.tsx     # Business Analytics & CSV Export
│   ├── components
│   │   ├── Navbar.tsx               # Top Navbar with Demo Role Switcher
│   │   ├── Sidebar.tsx              # Role-specific Collapsible Sidebar
│   │   ├── NotificationModal.tsx    # Notification Center Drawer
│   │   ├── PaymentModal.tsx         # Payment Simulation (UPI, Card, Cash)
│   │   ├── InvoiceModal.tsx         # Printable / PDF Ride Receipt
│   │   ├── RatingModal.tsx          # 5-Star Review & Compliment Modal
│   │   ├── MapSimulator.tsx         # Vector GPS Route Simulation
│   │   ├── Charts.tsx               # SVG Admin Charts (Rides, Fleet, Revenue)
│   │   └── Toast.tsx                # Toast Notification System
│   ├── data
│   │   ├── users.json               # 10+ Seed Passengers & Admin
│   │   ├── drivers.json             # 10+ Seed Car & Bike Drivers
│   │   ├── rides.json               # 20+ Seed Rides across all statuses
│   │   ├── payments.json            # 10+ Payment Simulation Records
│   │   └── notifications.json       # 20+ Notification Records
│   └── lib
│       ├── types.ts                 # TypeScript Data Models & Types
│       ├── fareCalculator.ts        # City Distance Matrix & Fare Calculations
│       └── storage.ts               # LocalStorage / SessionStorage CRUD Engine
└── README.md
```

---

## 🚀 How to Run the Application

### 1. Install Dependencies
```bash
npm install
```

### 2. Start the Development Server
```bash
npm run dev
```

The application will be live at:
```
http://localhost:3000
```

### 3. Build for Production
```bash
npm run build
npm start
```

---

## 🔑 Demo Login Credentials

You can use the **1-Click Quick Demo Login Switcher** located in the top navigation bar or the Login page, or enter credentials manually:

| Role | Name | Email | Password | Destination Route |
| :--- | :--- | :--- | :--- | :--- |
| **Passenger** | Ravi Kumar | `ravi@gmail.com` | `password123` | `/user/dashboard` |
| **Driver (Car)** | Arun Prakash | `arun@gmail.com` | `password123` | `/driver/dashboard` |
| **Driver (Bike)** | Priya Sundaram | `priya@gmail.com` | `password123` | `/driver/dashboard` |
| **Admin** | System Admin | `admin@rideshare.com` | `adminpassword` | `/admin/dashboard` |

---

## 🎯 Viva / Project Demonstration Walkthrough

1. **Landing Page (`/`)**:
   - Demonstrate the Hero section and live **Fare Estimator widget** (toggle Car vs Bike, change pickup & destination, and view instant fare calculation).
2. **Passenger Booking Flow (`/user/book-ride`)**:
   - Book a Car or Bike ride from "Chennai Central" to "T Nagar".
   - Note the generated unique Ride ID (e.g. `R101`) and the initial status `Pending`.
3. **Driver Acceptance Flow (`/driver/requests`)**:
   - Switch role to Driver (Arun or Priya) via the Demo Switcher.
   - Observe the incoming request broadcast in the real-time queue.
   - Click **Accept Ride** (concurrency check verifies `ride.status === 'Pending'`).
4. **Trip Lifecycle Progression (`/driver/active-ride`)**:
   - Driver clicks **Mark as Arrived at Pickup**.
   - Driver enters passenger's 4-digit OTP and clicks **Start Ride**.
   - Driver reaches destination and clicks **Complete Ride**.
5. **Payment Simulation & Rating (`/user/rides` & `/user/history`)**:
   - Switch back to Passenger.
   - Click **Pay Now** to trigger the simulated payment modal (UPI QR / Card / Cash).
   - Click **Rate Driver** to give a 5-star review.
   - Click **View Receipt** to inspect the printable invoice.
6. **Admin Management & Reports (`/admin/dashboard` & `/admin/reports`)**:
   - View updated platform KPIs and interactive charts.
   - Test User and Driver CRUD operations.
   - Click **Export Users CSV**, **Export Drivers CSV**, or **Export Rides CSV**.
   - Click **Reset Demo DB** if you want to reset everything back to initial state.
