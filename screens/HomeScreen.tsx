"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";

export default function HomeScreen() {
  const router = useRouter();

  const handleLogout = () => {
    document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC; SameSite=Lax; Secure";
    router.push("/login");
  };

  return (
    <div className="relative w-full h-full flex flex-col bg-[#F7F8FD]">
      {/* Hero Banner Image */}
      <div className="relative w-full h-[220px] shrink-0">
        <Image
          src="/assets/home/Hero Image.png"
          alt="Hero Banner"
          fill
          className="object-cover"
          priority
        />
      </div>

      {/* Main Home Screen Content Area */}
      <div className="flex-1 flex flex-col items-center justify-center p-4">
        <h2 className="text-lg font-semibold text-zinc-800">Home Screen Content</h2>
        <button
          onClick={handleLogout}
          className="mt-4 px-4 py-2 bg-rose-500 hover:bg-rose-600 text-white rounded-md text-sm font-medium cursor-pointer transition-colors"
        >
          Logout
        </button>
      </div>
    </div>
  );
}
