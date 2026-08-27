# Ride Sharing System (Car & Bike)

A modern, responsive, frontend-only Web-Based Ride Sharing System for **Car and Bike rides** built with **Next.js (App Router)**, **React.js (JavaScript ES6+ / JSX)**, **HTML5**, **External CSS3 stylesheets**, and **LocalStorage / SessionStorage** data persistence.

---

## 🌟 Key Project Features

### 1. Technology Implementation

- **Pure JavaScript & React.js**: 100% JavaScript (`.js` and `.jsx` files only). No TypeScript.
- **External CSS Stylesheets**: Clean, handwritten, modular CSS files in `src/styles/` (`globals.css`, `navbar.css`, `sidebar.css`, `login.css`, `dashboard.css`, `booking.css`, `ride.css`, `admin.css`, `modal.css`, `responsive.css`). No Tailwind CSS or Bootstrap.
- **Client-Side State & Storage**: React hooks (`useState`, `useEffect`, `useContext`) paired with browser `localStorage` and `sessionStorage`. Zero Redux or unnecessary state libraries.
- **Simulated Geo-Based Driver Matching**: Real-time proximity calculation (`driverMatcher.js`) calculating distance between passenger pickup coordinates and nearby available drivers (e.g., `1.2 km away, Car, Available`).

### 2. Multi-Role Architecture

- **Passenger / User Hub**: Interactive ride booking for Cars and Bikes, dynamic distance-based fare calculation, live active trip tracker with GPS route simulator, printable invoices, and 5-star driver reviews.
- **Driver Partner Console**: Availability switch (`● ONLINE` / `○ OFFLINE`), incoming broadcast request queue with concurrency protection, step-by-step trip lifecycle progression (Arrived ➔ Start with 4-Digit OTP ➔ Complete), and earnings summary.
- **Administrator Portal**: Executive metrics (Total Users, Drivers, Active Trips, Revenue), interactive SVG charts, full User CRUD, Driver CRUD (with account activation toggle), master dispatch table, and 1-click CSV data export.

### 3. Dynamic Fare Engine

- **City Car**: Base Fare ₹50 + ₹15/km
- **Swift Bike**: Base Fare ₹30 + ₹8/km
- Built-in metro distance matrix and duration estimator.

---

## 🏗️ Project Architecture & Data Flow

```
[ Browser Client ]
       │
       ▼
[ Next.js App Router (JavaScript ES6+ / JSX) ]
       │
       ├─► Passenger Hub (/user/...)
       ├─► Driver Console (/driver/...)
       └─► Admin Portal (/admin/...)
       │
       ▼
[ Storage & Reactive Event Bus (storage.js) ]
       │
       ├─► LocalStorage (rss_users, rss_drivers, rss_rides, rss_payments, rss_notifications)
       └─► SessionStorage (rss_currentUser)
```

> **Academic Architecture Note**: This frontend implementation uses browser storage and seed JSON files. External backend databases (e.g., MongoDB, MySQL, Redis, WebSockets, Kafka, Docker) represent future enterprise scalability enhancements.

---

## 📂 Project Structure

```
d:\Ride_Sharing
├── package.json
├── next.config.mjs
├── README.md
├── src
│   ├── app
│   │   ├── layout.jsx               # Root layout importing external CSS
│   │   ├── page.jsx                 # Landing page with live Fare Estimator
│   │   ├── login/page.jsx           # Multi-role login + Demo Switcher
│   │   ├── register/page.jsx        # Registration with Driver vehicle specs
│   │   ├── user
│   │   │   ├── layout.jsx
│   │   │   ├── dashboard/page.jsx   # Passenger Dashboard
│   │   │   ├── book-ride/page.jsx   # Ride Booking Form & Live Fare Calc
│   │   │   ├── rides/page.jsx       # Active Trip Tracker & Map Simulator
│   │   │   ├── history/page.jsx     # Ride History, Invoices & Reviews
│   │   │   └── profile/page.jsx     # Passenger Profile & SOS Contact
│   │   ├── driver
│   │   │   ├── layout.jsx
│   │   │   ├── dashboard/page.jsx   # Driver Dashboard & Online Toggle
│   │   │   ├── requests/page.jsx    # Incoming Requests Queue
│   │   │   ├── active-ride/page.jsx # Trip Lifecycle & OTP Verification
│   │   │   ├── history/page.jsx     # Completed Trips & Payouts
│   │   │   └── profile/page.jsx     # Vehicle Specs & License Editor
│   │   └── admin
│   │       ├── layout.jsx
│   │       ├── dashboard/page.jsx   # Executive Dashboard & SVG Charts
│   │       ├── users/page.jsx       # User Management CRUD
│   │       ├── drivers/page.jsx     # Driver Management CRUD
│   │       ├── rides/page.jsx       # Master Ride Dispatch Management
│   │       └── reports/page.jsx     # Analytics & CSV Export
│   ├── components
│   │   ├── Navbar.jsx               # Top navigation with Demo Persona Switcher
│   │   ├── Sidebar.jsx              # Role-specific collapsible sidebar
│   │   ├── Footer.jsx               # Academic project footer
│   │   ├── DashboardCard.jsx        # Reusable metric card
│   │   ├── RideCard.jsx             # Reusable trip card
│   │   ├── DriverCard.jsx           # Reusable nearby driver card
│   │   ├── StatusBadge.jsx          # Reusable status indicator
│   │   ├── NotificationPanel.jsx    # Notification drawer panel
│   │   ├── BookingForm.jsx          # Interactive ride booking form
│   │   ├── RideTable.jsx            # Reusable responsive ride table
│   │   ├── Modal.jsx                # Generic modal component
│   │   ├── Loading.jsx              # Reusable loading indicator
│   │   ├── PaymentModal.jsx         # Simulated UPI/Card/Cash payment gateway
│   │   ├── InvoiceModal.jsx         # Printable / PDF ride receipt
│   │   ├── RatingModal.jsx          # 5-Star driver feedback modal
│   │   ├── MapSimulator.jsx         # Vector SVG GPS route simulator
│   │   ├── Charts.jsx               # SVG Admin visual charts
│   │   └── Toast.jsx                # Toast feedback system
│   ├── data
│   │   ├── users.json               # Seed passengers & admin
│   │   ├── drivers.json             # Seed car & bike drivers
│   │   ├── rides.json               # Seed ride trips
│   │   ├── payments.json            # Seed payment records
│   │   └── notifications.json       # Seed notifications
│   ├── lib
│   │   ├── driverMatcher.js         # Simulated GPS coordinate proximity matcher
│   │   ├── fareCalculator.js        # City distance matrix & fare formulas
│   │   └── storage.js               # LocalStorage / SessionStorage CRUD engine
│   └── styles
│       ├── globals.css              # Global styles, variables & resets
│       ├── navbar.css               # Navbar layout & dropdowns
│       ├── sidebar.css              # Sidebar layout & links
│       ├── login.css                # Auth forms & role tabs
│       ├── dashboard.css            # Dashboard stat cards & banners
│       ├── booking.css              # Vehicle selectors & nearby drivers
│       ├── ride.css                 # Lifecycle stepper & map simulator
│       ├── admin.css                # Admin charts & toolbars
│       ├── modal.css                # Modals, drawer & invoice styles
│       └── responsive.css           # Mobile & tablet media queries
```

---

## 🚀 How to Run the Application

### 1. Open Project Directory

```powershell
d:
cd d:\Ride_Sharing
```

### 2. Start the Development Server

```powershell
npm run dev
```

Open your browser at:

```
http://localhost:3000
```

### 3. Production Build

```powershell
npm run build
npm start
```

---

## 🔑 Demo Personas & Credentials

| Role              | Name           | Email                 | Password        | Target Page         |
| :---------------- | :------------- | :-------------------- | :-------------- | :------------------ |
| **Passenger**     | Ravi Kumar     | `ravi@gmail.com`      | `password123`   | `/user/dashboard`   |
| **Driver (Car)**  | Arun Prakash   | `arun@gmail.com`      | `password123`   | `/driver/dashboard` |
| **Driver (Bike)** | Priya Sundaram | `priya@gmail.com`     | `password123`   | `/driver/dashboard` |
| **Administrator** | System Admin   | `admin@rideshare.com` | `adminpassword` | `/admin/dashboard`  |

_(Tip: You can also use the **"Demo Switcher"** button in the top navigation bar or the 1-click login buttons on the login page for quick demonstrations!)_
