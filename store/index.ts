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

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
