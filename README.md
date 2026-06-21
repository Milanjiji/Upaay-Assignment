# 🎬 Movie Ticket Booking Application

---

## 🔗 Live Demo
* **Live Vercel Link:** [Link to Live App](https://your-vercel-deployment-link.vercel.app)

---

## 1. Approach & Tech Stack

This project is a premium, full-stack Movie Ticket Reservation application engineered with a **mobile-first design language** (optimized for a 390px viewport, centered on desktop screens) and a robust **distributed system architecture**. 

### Our Architectural Approach:
* **Mobile-First Layout**: Strict CSS constraints ensure a consistent, responsive mobile viewport (`390px` width) centered on desktop viewports.
* **Optimized Client-Server Sync**: Leverages **SWR** (Stale-While-Revalidate) for aggressive data caching, preventing screen flicker and ensuring instantaneous client navigation.
* **Transaction Safety & Concurrency Control**: Uses **Mongoose/MongoDB transactions** for ACID compliance and a **Redis-backed distributed lock (Redlock)** to prevent race conditions during ticket booking under high traffic.

### Tech Stack:
* **Frontend**: Next.js (React 19), Tailwind CSS, Redux Toolkit (state persistence via localStorage), SWR (caching & mutations), and Lucide React.
* **Backend**: Node.js, Express, MongoDB (Mongoose), Redis (ioredis & redlock).
* **Testing**: Jest and Supertest for automated integration test coverage.

---

## 2. Level 1 Requirements & Implementation

### 2.1. Seat Grid Selection
> **Requirement**: Seat Grid Selection
> * "Programmatic seat matrix grid dynamically generated using row letters (A-M) and columns (1-30). Handles three interactive states: Available (light borders), Selected (Indigo fill), and Occupied (disabled gray fill)."
> * **Constraint**: Limit of maximum 10 seats per transaction on both frontend layout and backend API.

* **Implementation**: The seat selection screen dynamically maps seats based on row letter tags (`A-M`) and column index configurations (`1-30`). The seat components evaluate the state returned by the database to render matching visual fills. Selection clicks verify that the count of active selections does not exceed 10. The backend validates `seats.length > 10` during the transaction lifecycle to block malicious API requests.
* **How to Test**:
  1. Open the app, select a movie, select a schedule, and proceed to the seat selection grid.
  2. Click seats to select them (they will highlight with an Indigo fill).
  3. Try selecting more than 10 seats; verify that a warning alert prevents selection.

### 2.2. Booking Summary & Payment Details
> **Requirement**: Booking Summary & Payment Details
> * "Checkout screen summarizing selected tickets, calculating ₹20 booking fee, payment method toggle (Card vs. Wallet), and a checkbox to save card details."

* **Implementation**: The checkout page displays an itemized receipt (showing selected seats, ticket base price, a flat `₹20` booking fee, and total amount due). Users can toggle between credit card and wallet payments. Checking "Save details" securely saves the user credentials (masked) to `localStorage` to prepopulate checkout forms on future purchases, which are cleared immediately when unchecked.
* **How to Test**:
  1. Select a few seats and proceed to the Checkout screen.
  2. Review the breakdown (base price + ₹20 booking fee).
  3. Toggle payment methods (Card vs. Wallet) and enter details. Tick the "Save payment details" checkbox to verify persistence.

### 2.3. My Bookings & Cancellation
> **Requirement**: My Bookings & Cancellation
> * "My Bookings page displaying upcoming vs. past bookings dynamically sorted based on the showtime clock. Features interactive ticket cancellation that releases seats in the database instantly and invalidates the client SWR cache."

* **Implementation**: The bookings page contains tabbed segments for active/upcoming tickets vs. past showtimes (derived by comparing the show date/time against the current clock). Cancelling an active ticket sends a `DELETE` request to release the seats (updating their status back to `"available"`) in MongoDB and triggers an SWR `mutate` call to invalidate local caches instantly.
* **How to Test**:
  1. Book a ticket and navigate to the "My Tickets" screen.
  2. Click the "My Bookings" tab to view the active booking details.
  3. Click **Cancel Booking**. Verify that the booking is removed from the active list.
  4. Return to the booking screen for that showtime and verify the seats are now marked as available.

---

## 3. Level 2 Requirements & Implementation

### 3.1. Simulated Payment Gateway Validation
> **Requirement**: Simulated Payment Gateway Validation
> * "Strict validations on the frontend checkout page (Name cannot be empty, Card Number must be 16 digits, Expiry must be MM/YY, CVC/CVV must be 3-4 digits, Wallet Phone must be 10 digits). Entering '0000000000000000' as a card number simulates a declined payment."

* **Implementation**: Checkout forms validate formats using regex patterns. If the user submits `0000000000000000` as the card number, the backend mocks a declined payment transaction, returning a simulated payment failure error to the frontend.
* **How to Test**:
  1. On the Checkout screen, try entering invalid inputs (e.g. short phone number or invalid expiry date) and check for validation warnings.
  2. Enter `0000000000000000` for the card number, complete the form, and click purchase. Verify the transaction fails with a payment declined warning.

### 3.2. Protected Routes & Auth Middleware
> **Requirement**: Protected Routes & Auth Middleware
> * "Express authentication middleware (`verifyUser`) verifies requests via the `x-user-id` header (the MongoDB user ID session cookie). Next.js edge middleware protects routes, redirecting unauthenticated users to `/login` and authenticated users away from login/register pages. Emails ending in `@upaay.creative` automatically sign up as administrators."

* **Implementation**: Route security is enforced at both layers. In Next.js, `middleware.ts` intercepts router requests, checking cookies for session credentials. In Express, routes are wrapped with `verifyUser` or `verifyAdmin` controllers. Registration emails containing the suffix `@upaay.creative` are assigned the role `"admin"` upon record insertion.
* **How to Test**:
  1. Try accessing `/admin` or checkout screens directly without logging in; verify you are redirected to `/login`.
  2. Log in using `admin@upaay.creative` (password: `admin123`) to access the admin dashboard.
  3. Log in with a standard user email and verify that accessing `/admin` displays an Access Denied message.

### 3.3. Database Integration & ACID Properties
> **Requirement**: Database Integration & ACID Properties
> * "MongoDB and Mongoose integration. Booking transactions are wrapped in a formal Mongoose session transaction (`session.startTransaction()`) to guarantee ACID properties; seat reservation and booking record creation succeed or fail atomically."

* **Implementation**: We implemented Mongoose-session transactions inside the `POST /api/bookings` route handler. If either the Showtime seat update fails or the Booking document fails to write, the transaction aborts automatically (`session.abortTransaction()`), preventing orphaned seat holds.
* **How to Test**:
  * Attempted bookings write records directly to the database. All transaction states can be audited in the Admin Panel's Transaction Ledger.

### 3.4. Advanced Concurrency Control
> **Requirement**: Advanced Concurrency Control
> * "Redis distributed locking using the Redlock algorithm (`redlock.acquire()`) on the showtime resource lock key (`locks:showtime:<id>`). This prevents race conditions and double bookings when two users try to purchase the exact same seats at the exact same split-second."

* **Implementation**: Redlock acts as a guard dog. When a booking request arrives, it attempts to acquire a lock on the showtime ID resource. Concurrent bookings targeting the same showtime are blocked at the lock layer (due to `retryCount: 0` fast-failing configuration) and immediately return a `409 Conflict`.
* **How to Test**: Run the automated integration test suite (detailed below).

---

## 4. Concurrency Verification (Code & Testing)

Because millisecond-level race conditions cannot be tested manually, we write automated integration tests to prove correctness.

### Core Backend Redis Lock Implementation (`backend/routes/bookings.js`):
```javascript
// 1. Acquire Redis lock on the specific showtime for 10 seconds (retryCount: 0 fails immediately)
let lock;
try {
  lock = await redlock.acquire([`locks:showtime:${showtimeId}`], 10000);
} catch (error) {
  return res.status(409).json({ message: "High traffic: Someone else is currently booking tickets for this show..." });
}

const session = await mongoose.startSession();
session.startTransaction();

try {
  // 2. Perform seat checks & reserve within the Mongoose transaction session
  const showtime = await Showtime.findById(showtimeId).session(session);
  // ... check availability & update Showtime & create Booking document
  await session.commitTransaction();
  res.status(201).json({ message: "Booking placed successfully", booking });
} catch (err) {
  await session.abortTransaction();
  res.status(500).json({ message: "Failed to place booking" });
} finally {
  session.endSession();
  if (lock) {
    await lock.release(); // 3. Guarantee lock release in the finally block
  }
}
```

### About the Integration Test (`backend/tests/concurrency.test.js`):
- Uses **Jest** and **Supertest**.
- Connects directly to the test MongoDB and Redis server.
- Fetches a real showtime and two available seats from the database.
- Fires **two identical HTTP POST requests simultaneously** using `Promise.all()`.
- Asserts that exactly one request succeeds (`201 Created`), while the other is instantly blocked by Redlock and returns `409 Conflict` (with the high-traffic message).
- Automatically cleans up the test booking and restores seat states to `"available"`.

### Run the Integration Test:
```bash
cd backend
npm run test
```

---

## 5. Setup & Running Locally

### Prerequisites:
* **Node.js** (v18 or higher)
* **MongoDB** (running locally on port `27017` or remote instance)
* **Redis** (running locally on port `6379` or remote Upstash instance)

### 1. Backend Setup:
```bash
cd backend

# Create your environmental configuration
cp .env.example .env

# Install backend dependencies
npm install

# Seed the database (adds movies, theaters, showtimes, and admin account)
npm run seed

# Run the backend server (starts on http://localhost:5001)
npm run dev
```
* **Default Admin Account**: `admin@upaay.creative`
* **Default Admin Password**: `admin123`

### 2. Frontend Setup:
```bash
# Return to the project root directory
cd ..

# Create your local environmental configuration
cp .env.example .env.local

# Install frontend dependencies
npm install

# Run the frontend application (starts on http://localhost:3000)
npm run dev
```

---

## 6. Project Structure & Package Technologies

### Project Layout:
```text
├── app/                  # Next.js 16 Pages & Routing
│   ├── admin/            # Admin Panel Screen (Dashboard to view/edit movies, theaters, showtimes)
│   ├── login/            # Authentication Screen (Login & Signup form)
│   ├── globals.css       # CSS Variables & Tailwind Imports
│   ├── layout.tsx        # Global Layout (Root Store Provider wrapper)
│   └── page.tsx          # Main routing manager (wraps screen state flows)
├── components/           # Reusable Client-side Components (buttons, layouts)
├── screens/              # Core screen flows
│   ├── BookingScreen.tsx # Screen showing date, time, and seat grid selection
│   ├── CheckoutScreen.tsx# Checkout bill, payment validation, and options
│   ├── HistoryScreen.tsx # My Bookings / Ticket ledger page (upcoming vs past list)
│   ├── MovieDetailScreen.tsx # Movie details, cast, description screen
│   └── MovieScreen.tsx   # Dashboard/Home view listing categories
├── store/                # Redux Toolkit Global State
│   ├── store.ts          # Main Store Configuration
│   ├── bookingSlice.ts   # Tracks active movie, theater, showtime, selected seats
│   ├── navigationSlice.ts# App-wide routing screen history cache (back stacks)
│   └── StoreProvider.tsx # Client-side state hydration wrapper (localStorage preservation)
├── backend/              # Node.js Express REST API
│   ├── config/           # Setup connections for MongoDB and Redis (Redlock setup)
│   ├── middleware/       # Token validation check (verifyUser, verifyAdmin)
│   ├── models/           # Mongoose schemas (Movie, Theater, Showtime, Booking, User)
│   ├── routes/           # REST endpoints (auth, movies, theaters, showtimes, bookings, favorites)
│   ├── tests/            # Automated Integration Tests (Jest & Supertest)
│   │   └── concurrency.test.js # Verifies lock preventions under race conditions
│   ├── seed.js           # Seeds databases with mock theaters and movies
│   └── server.js         # Entry server file
├── middleware.ts         # Edge route-guard check cookie token redirection
└── package.json          # Frontend dependencies
```

### Core Technologies Used:
* **Frontend Packages**:
  - `next`: `^16.2.9` (Next.js Framework with React 19)
  - `@reduxjs/toolkit`: `^2.12.0` (Global state management and local storage persistence)
  - `react-redux`: `^9.3.0` (React bindings for Redux)
  - `swr`: `^2.4.1` (SWR query caching & mutate hooks)
  - `tailwindcss`: `^4.0.0` (Styling system)
  - `lucide-react`: Icon pack integration
* **Backend Packages**:
  - `express`: `^4.19.2` (REST API layer)
  - `mongoose`: `^8.3.1` (MongoDB driver)
  - `ioredis`: `^5.11.1` (Redis client connection)
  - `redlock`: `^5.0.0-beta.2` (Distributed locking library)
  - `bcryptjs`: `^2.4.3` (Security passwords encryption)
  - `jest` & `supertest`: Concurrency testing frameworks
