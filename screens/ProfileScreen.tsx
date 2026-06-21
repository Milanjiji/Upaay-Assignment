"use client";

import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { RootState } from "@/store";
import { logoutUser } from "@/store/slices/authSlice";
import { resetNavigation } from "@/store/slices/navigationSlice";
import { resetBooking } from "@/store/slices/bookingSlice";

export default function ProfileScreen() {
  const dispatch = useDispatch();
  const router = useRouter();
  const user = useSelector((state: RootState) => state.auth.user);

  if (!user) {
    return (
      <div className="relative w-full h-full flex flex-col items-center justify-center bg-[#F7F8FD] px-6.5">
        <div className="w-25 h-25 rounded-full bg-zinc-200 flex items-center justify-center text-zinc-500 text-[32px] font-bold shadow-sm font-inter shrink-0 mb-5">
          ?
        </div>
        <h2 className="text-[16px] font-semibold text-zinc-900 font-inter leading-tight text-center">
          No user logged in
        </h2>
        <span className="text-[12px] font-normal text-[#64748B] font-inter text-center w-full mt-1.5">
          Please log in to view your profile and manage tickets.
        </span>
        <button
          onClick={() => { 
            dispatch(resetNavigation());
            window.location.href = "/login"; 
          }}
          className="mt-8 w-full h-9.25 rounded-[5px] bg-[#4F46E5] text-[#FFFFFF] font-semibold text-[14px] flex items-center justify-center cursor-pointer font-inter hover:bg-[#4338ca] transition-colors"
        >
          Login
        </button>
      </div>
    );
  }

  // Fallback details if Redux slice isn't hydrated yet
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

  return (
    <div className="relative w-full h-full flex flex-col items-center bg-[#F7F8FD] pt-25 px-6.5">
      {/* User avatar circle in center top */}
      <div className="w-25 h-25 rounded-full bg-linear-to-tr from-[#4F46E5] to-[#6366F1] flex items-center justify-center text-white text-[32px] font-bold shadow-sm font-inter shrink-0">
        {displayName.slice(0, 2).toUpperCase()}
      </div>

      {/* Name: same font/text type of movie name in movie details page */}
      <h2 className="text-[16px] font-semibold text-zinc-900 font-inter leading-tight mt-5 text-center">
        {displayName}
      </h2>

      {/* Email: same font/text type of theater location from home screen */}
      <span className="text-[12px] font-normal text-[#64748B] font-inter truncate leading-3.75 mt-1.5 text-center w-full">
        {displayEmail}
      </span>

      {/* Action Buttons Container */}
      <div className="w-full flex flex-col gap-3 mt-12">
        {user?.role === "admin" && (
          <button
            onClick={() => router.push("/admin")}
            className="w-full h-12 bg-white border border-[#CED6E0] rounded-lg flex items-center justify-between px-4 cursor-pointer hover:bg-zinc-50 transition-colors"
          >
            <div className="flex items-center gap-2.5">
              <span className="text-[16px]">⚙️</span>
              <span className="text-[13px] font-semibold text-zinc-800 font-inter">
                Admin Console
              </span>
            </div>
            <svg className="w-3.5 h-3.5 text-zinc-400" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        )}

        <button
          onClick={handleLogout}
          className="w-full h-9.25 rounded-[5px] bg-[#4F46E5] text-[#FFFFFF] font-semibold text-[14px] flex items-center justify-center cursor-pointer font-inter hover:bg-[#4338ca] transition-colors"
        >
          Log Out
        </button>
      </div>
    </div>
  );
}
