"use client";

import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export type ActiveView =
  | "home"
  | "details"
  | "select_theatre"
  | "select_schedule"
  | "select_seats"
  | "booking_summary"
  | "checkout"
  | "payment_success"
  | "tickets"
  | "favorites"
  | "profile";

interface NavigationState {
  activeView: ActiveView;
  history: ActiveView[];
}

const initialState: NavigationState = {
  activeView: "home",
  history: [],
};

export const navigationSlice = createSlice({
  name: "navigation",
  initialState,
  reducers: {
    navigateTo: (state, action: PayloadAction<ActiveView>) => {
      state.history.push(state.activeView);
      state.activeView = action.payload;
    },
    goBack: (state) => {
      const previous = state.history.pop();
      if (previous) {
        state.activeView = previous;
      } else {
        state.activeView = "home";
      }
    },
    resetNavigation: (state) => {
      state.activeView = "home";
      state.history = [];
    },
  },
});

export const { navigateTo, goBack, resetNavigation } = navigationSlice.actions;
export default navigationSlice.reducer;
