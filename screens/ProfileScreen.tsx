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
      <div className="relative w-full h-full flex flex-col items-center justify-center bg-[#F7F8FD] px-[26px]">
        <div className="w-[100px] h-[100px] rounded-full bg-zinc-200 flex items-center justify-center text-zinc-500 text-[32px] font-bold shadow-sm font-inter shrink-0 mb-[20px]">
          ?
        </div>
        <h2 className="text-[16px] font-semibold text-zinc-900 font-inter leading-tight text-center">
          No user logged in
        </h2>
        <span className="text-[12px] font-normal text-[#64748B] font-inter text-center w-full mt-[6px]">
          Please log in to view your profile and manage tickets.
        </span>
        <button
          onClick={() => { window.location.href = "/login"; }}
          className="mt-[32px] w-full h-[37px] rounded-[5px] bg-[#4F46E5] text-[#FFFFFF] font-semibold text-[14px] flex items-center justify-center cursor-pointer font-inter hover:bg-[#4338ca] transition-colors"
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
    <div className="relative w-full h-full flex flex-col items-center bg-[#F7F8FD] pt-[100px] px-[26px]">
      {/* User avatar circle in center top */}
      <div className="w-[100px] h-[100px] rounded-full bg-gradient-to-tr from-[#4F46E5] to-[#6366F1] flex items-center justify-center text-white text-[32px] font-bold shadow-sm font-inter shrink-0">
        {displayName.slice(0, 2).toUpperCase()}
      </div>

      {/* Name: same font/text type of movie name in movie details page */}
      <h2 className="text-[16px] font-semibold text-zinc-900 font-inter leading-tight mt-[20px] text-center">
        {displayName}
      </h2>

      {/* Email: same font/text type of theater location from home screen */}
      <span className="text-[12px] font-normal text-[#64748B] font-inter truncate leading-[15px] mt-[6px] text-center w-full">
        {displayEmail}
      </span>

      {/* Action Buttons Container */}
      <div className="w-full flex flex-col gap-[12px] mt-[48px]">
        {user?.role === "admin" && (
          <button
            onClick={() => router.push("/admin")}
            className="w-full h-[48px] bg-white border border-[#CED6E0] rounded-[8px] flex items-center justify-between px-[16px] cursor-pointer hover:bg-zinc-50 transition-colors"
          >
            <div className="flex items-center gap-[10px]">
              <span className="text-[16px]">⚙️</span>
              <span className="text-[13px] font-semibold text-zinc-800 font-inter">
                Admin Console
              </span>
            </div>
            <svg className="w-[14px] h-[14px] text-zinc-400" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        )}

        <button
          onClick={handleLogout}
          className="w-full h-[37px] rounded-[5px] bg-[#4F46E5] text-[#FFFFFF] font-semibold text-[14px] flex items-center justify-center cursor-pointer font-inter hover:bg-[#4338ca] transition-colors"
        >
          Log Out
        </button>
      </div>
    </div>
  );
}
