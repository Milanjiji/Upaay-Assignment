# Cinema Ticket Reservation Application

A modern, full-stack Movie Ticket Reservation web application optimized for a mobile-first viewport. This application allows users to browse movies, choose showtimes/theaters, interact with a real-time seat matrix grid to select seats, complete transactions, view active tickets via QR codes, and cancel bookings.

---

## 1. Approach & Tech Stack

This project is built as a complete full-stack web application:

*   **Frontend**: 
    *   **Next.js 16 (React 19)**: Leverages Server Components for fast initial loads and Client Components for rich interactive states.
    *   **Tailwind CSS**: Custom utility classes configured to match the provided Figma mobile design guidelines.
    *   **Viewport**: Strict mobile-first viewport design (fixed container size modeled after a `390px` width layout) with hidden scrollbars for a premium app feel.
*   **Backend**:
    *   **Node.js & Express**: Provides a RESTful API containing clean modular routers for authentication, movies, theaters, showtimes, favorites, and bookings.
    *   **MongoDB & Mongoose**: Flexible document schema handling relations between Users, Movies, Theaters, Showtimes, and Bookings.
*   **Core Systems**:
    *   **Programmatic Seat Matrix Grid**: Generates a theater layout dynamically based on row labels (e.g., A-M) and column configurations (e.g., 1-12) saved in MongoDB. It features interactive seat states:
        *   `Available`: Sleek light gray border seats.
        *   `Selected`: Indigo filled seats.
        *   `Occupied`: Disabled gray filled seats.
    *   **Booking Validation**: Enforces a strict selection limit of **10 seats** per transaction on both frontend layout clicks and backend booking endpoints to prevent database abuse.
*   **Bonus Features**:
    *   **My Bookings & Tickets Page**: Features tabbed sections (Upcoming Bookings vs. Past Bookings) that dynamically sort tickets based on showtime dates and hours relative to the current local clock.
    *   **Interactive Booking Cancellation**: Allows users to cancel any upcoming ticket directly. Cancelling sends a `DELETE` request to release the seats in MongoDB (marking them back to `"available"`) and immediately invalidates the client-side SWR cache for instant UI updates.
    *   **Mouse Drag-to-Scroll**: Horizontal lists (movies, dates) support desktop mouse dragging (`cursor-grab` states) for smooth scrolling without requiring standard touchpad gestures.
    *   **Contrast Overlay Banner**: Adds a dark glassmorphism overlay (`#151130B2`) on hero banners to guarantee text legibility.

---

## 2. State Management Logic

Global state management and client-side data caching are handled using a combination of **Redux Toolkit** and **SWR**:

### Redux Toolkit (State Persistence)
*   Global Redux slices manage the active session data, screen navigation history, and user selections:
    *   `navigationSlice`: Manages active page coordinates and history stack back-tracks.
    *   `bookingSlice`: Holds the active selection state (selected movie details, theater configurations, showtime date/time, selected seat list, and price totals).
*   **Custom Storage Persistence (Hydration-Safe)**:
    *   To prevent loss of booking progress on manual page refreshes, a Redux store subscriber runs in the browser context. Every state change automatically stringifies and saves the `booking` and `navigation` branches to `localStorage`.
    *   **Hydration Mismatch Prevention**: To avoid React hydration errors (mismatches between static server-rendered HTML and client-rendered state), the initial Redux store is created with server-safe empty states. A client-side `useEffect` hook inside the `StoreProvider` reads the saved `localStorage` data after mount and dispatches `rehydrateBooking` and `rehydrateNavigation` actions to restore the selection context seamlessly.
    *   The `localStorage` cache is cleared automatically once a booking is finalized or explicitly reset.

### SWR (Client-Side Caching)
*   SWR handles asynchronous query caching (such as movie listings, favorites list, bookings list, and seat occupancy states).
*   Mutates caches optimistically (e.g., toggling movie favorites updates the UI instantly, rolling back only if the database write fails) and invalidates showtime seating grids immediately upon checkout or booking cancellation.

---

## 3. Assumptions Made

1.  **Authentication**: A full JWT/sessions authentication flow was assumed to be out-of-scope for the assignment MVP. User sessions are verified using a mocked user ID token stored in cookies and passed in HTTP headers as `x-user-id` to identify and fetch user-specific favorites and bookings.
2.  **Fixed Base Pricing**: Assumed a fixed base pricing model of ₹280 per ticket for the MVP, dynamically multiplied by the number of selected seats, plus a standard ₹20 booking fee.
3.  **Responsive Layout**: Mobile responsiveness beyond the fixed `390px` mobile container was assumed to be unnecessary. The wrapper centers this fixed frame on larger desktop displays for testing purposes.

---

## 4. How to Run Locally

Follow these steps to run both the frontend and backend of the application locally:

### Prerequisites
*   [Node.js](https://nodejs.org/) installed (v18+ recommended)
*   A running [MongoDB Database](https://www.mongodb.com/) (Local Community Server or Atlas Cluster)

### Step 1: Clone and Set Up the Backend
1.  Navigate into the backend directory:
    ```bash
    cd backend
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Create a `.env` file in the root of the `backend` folder:
    ```env
    PORT=5001
    MONGODB_URI=mongodb://localhost:27017/cinema_booking
    ```
    *(Adjust the MONGODB_URI if you are using an Atlas cluster or different local db port).*
4.  *(Optional)* Seed the database with mock showtimes, movies, and theaters:
    ```bash
    npm run seed
    ```
5.  Start the backend server in development mode:
    ```bash
    npm run dev
    ```
    The server will start listening at `http://localhost:5001`.

### Step 2: Set Up and Run the Frontend
1.  Open a new terminal session and navigate to the project root directory:
    ```bash
    cd my-app
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Create a `.env.local` file in the root of the frontend folder:
    ```env
    NEXT_PUBLIC_API_URL=http://localhost:5001
    ```
4.  Start the Next.js development server:
    ```bash
    npm run dev
    ```
    The application will run locally at `http://localhost:3000`.
