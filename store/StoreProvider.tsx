"use client";

import { Provider } from "react-redux";
import { store } from "./index";
import { useEffect, useState } from "react";
import { rehydrateBooking } from "./slices/bookingSlice";
import { rehydrateNavigation } from "./slices/navigationSlice";

export default function StoreProvider({ children }: { children: React.ReactNode }) {
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    try {
      // 1. Read all states from localStorage first, before any dispatches
      const serializedBooking = localStorage.getItem("booking_state");
      const serializedNav = localStorage.getItem("navigation_state");

      // 2. Dispatch the parsed states to Redux
      if (serializedBooking) {
        store.dispatch(rehydrateBooking(JSON.parse(serializedBooking)));
      }
      if (serializedNav) {
        store.dispatch(rehydrateNavigation(JSON.parse(serializedNav)));
      }
    } catch (err) {
      console.error("Failed to rehydrate Redux state", err);
    } finally {
      setIsHydrated(true);
    }
  }, []);

  // Prevent rendering components with default/stale states until hydration completes
  if (!isHydrated) {
    return (
      <div className="w-full h-screen flex flex-col items-center justify-center bg-[#F7F8FD]">
        <div className="animate-spin rounded-full h-[40px] w-[40px] border-t-2 border-b-2 border-[#4F46E5] mb-[12px]" />
      </div>
    );
  }

  return <Provider store={store}>{children}</Provider>;
}
