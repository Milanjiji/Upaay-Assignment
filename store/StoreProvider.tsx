"use client";

import { Provider } from "react-redux";
import { store } from "./index";
import { useEffect } from "react";
import { rehydrateBooking } from "./slices/bookingSlice";
import { rehydrateNavigation } from "./slices/navigationSlice";

export default function StoreProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    try {
      const serializedBooking = localStorage.getItem("booking_state");
      if (serializedBooking) {
        store.dispatch(rehydrateBooking(JSON.parse(serializedBooking)));
      }
      const serializedNav = localStorage.getItem("navigation_state");
      if (serializedNav) {
        store.dispatch(rehydrateNavigation(JSON.parse(serializedNav)));
      }
    } catch (err) {
      console.error("Failed to rehydrate Redux state", err);
    }
  }, []);

  return <Provider store={store}>{children}</Provider>;
}
