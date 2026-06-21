"use client";

import { configureStore } from "@reduxjs/toolkit";
import navigationReducer from "./slices/navigationSlice";
import authReducer from "./slices/authSlice";
import bookingReducer from "./slices/bookingSlice";

export const store = configureStore({
  reducer: {
    navigation: navigationReducer,
    auth: authReducer,
    booking: bookingReducer,
  },
});

// Subscribe to save changes to localStorage (browser only)
if (typeof window !== "undefined") {
  store.subscribe(() => {
    try {
      const state = store.getState();
      localStorage.setItem("booking_state", JSON.stringify(state.booking));
      localStorage.setItem("navigation_state", JSON.stringify(state.navigation));
    } catch (err) {
      console.error("Failed to save Redux state to localStorage", err);
    }
  });
}

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
