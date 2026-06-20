"use client";

import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/store";
import { logoutUser } from "@/store/slices/authSlice";
import { resetNavigation } from "@/store/slices/navigationSlice";
import { resetBooking } from "@/store/slices/bookingSlice";

export default function ProfileScreen() {
  const dispatch = useDispatch();
  const user = useSelector((state: RootState) => state.auth.user);

  // Fallback details if Redux slice isn't hydrated yet (or standard mock info)
  const displayName = user?.name || "Hiring Manager";
  const displayEmail = user?.email || "hiring@upaay.creative";

  const handleLogout = () => {
    // Clear Redux auth state
    dispatch(logoutUser());
    // Clear booking state
    dispatch(resetBooking());
    // Reset navigation
    dispatch(resetNavigation());
    // Perform full page reload to trigger Next.js route middleware redirect to /login
    window.location.href = "/login";
  };

  const menuItems = [
    { title: "Personal Details", icon: "👤" },
    { title: "Payment Settings", icon: "💳" },
    { title: "Notifications", icon: "🔔" },
    { title: "Help & Support", icon: "💬" },
  ];

  return (
    <div className="relative w-full h-full flex flex-col bg-[#F7F8FD]">
      {/* Header */}
      <div className="absolute top-[28px] left-[26px] right-[26px] h-[30px] flex items-center justify-between">
        <h1 className="text-[20px] font-bold text-zinc-900 font-inter">Profile</h1>
      </div>

      {/* User Information Card: top 78px */}
      <div className="absolute top-[78px] left-[26px] right-[26px] bg-white rounded-[12px] p-[16px] border border-zinc-150 shadow-[0_4px_12px_rgba(0,0,0,0.02)] flex items-center gap-[16px]">
        {/* Avatar badge */}
        <div className="w-[60px] h-[60px] rounded-full bg-[#4F46E5] flex items-center justify-center text-white text-[22px] font-bold shadow-sm font-inter">
          {displayName.slice(0, 2).toUpperCase()}
        </div>
        
        {/* User text details */}
        <div className="flex flex-col gap-[2px]">
          <h2 className="text-[16px] font-bold text-zinc-900 font-inter leading-none">
            {displayName}
          </h2>
          <span className="text-[13px] font-normal text-zinc-500 font-inter truncate leading-none mt-[4px]">
            {displayEmail}
          </span>
        </div>
      </div>

      {/* Navigation settings options: top 178px */}
      <div className="absolute top-[168px] left-[26px] right-[26px] bottom-[89px] flex flex-col gap-[10px] overflow-y-auto scrollbar-none">
        {menuItems.map((item, idx) => (
          <button
            key={idx}
            onClick={() => alert(`${item.title} section is coming soon!`)}
            className="w-full h-[52px] bg-white rounded-[10px] border border-zinc-150 shadow-[0_2px_8px_rgba(0,0,0,0.01)] flex items-center justify-between px-[16px] cursor-pointer hover:bg-zinc-50 transition-colors"
          >
            <div className="flex items-center gap-[12px]">
              <span className="text-[18px]">{item.icon}</span>
              <span className="text-[14px] font-semibold text-zinc-800 font-inter">
                {item.title}
              </span>
            </div>
            {/* Arrow icon */}
            <svg className="w-[16px] h-[16px] text-zinc-400" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        ))}

        {/* Spacer */}
        <div className="flex-1 min-h-[10px]" />

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="w-full h-[48px] bg-rose-50 border border-rose-100 hover:bg-rose-100 rounded-[10px] flex items-center justify-center gap-[8px] cursor-pointer transition-colors text-rose-600 font-bold text-[14px] font-inter mt-[8px] mb-[16px]"
        >
          {/* Logout icon */}
          <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          Log Out
        </button>
      </div>
    </div>
  );
}
