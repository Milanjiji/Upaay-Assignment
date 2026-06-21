"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"login" | "signup">("login");
  const [redirectPath, setRedirectPath] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const redirect = params.get("redirect");
      if (redirect) {
        setRedirectPath(redirect);
      }
    }
  }, []);
  
  // Form field states
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  // Status states
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);
  const [loading, setLoading] = useState(false);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  const handleTabChange = (tab: "login" | "signup") => {
    setActiveTab(tab);
    setMessage(null);
    setName("");
    setEmail("");
    setPassword("");
    setConfirmPassword("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    // Basic front-end validations
    if (activeTab === "signup" && !name.trim()) {
      setMessage({ text: "Name is required", type: "error" });
      return;
    }
    if (!email.trim() || !password) {
      setMessage({ text: "Email and password are required", type: "error" });
      return;
    }
    if (activeTab === "signup" && password !== confirmPassword) {
      setMessage({ text: "Passwords do not match", type: "error" });
      return;
    }

    setLoading(true);

    try {
      const payload = activeTab === "login" 
        ? { email, password }
        : { name, email, password };

      const res = await fetch(`${API_URL}/api/auth/${activeTab}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Something went wrong");
      }

      // Set auth cookie (Expires in 1 day)
      const tokenValue = data.user.id;
      const secureFlag = window.location.protocol === "https:" ? "Secure;" : "";
      document.cookie = `token=${tokenValue}; path=/; max-age=86400; SameSite=Lax; ${secureFlag}`;

      setMessage({ text: activeTab === "login" ? "Login successful! Redirecting..." : "Registration successful! Redirecting...", type: "success" });
      
      // Clear form on success
      setName("");
      setEmail("");
      setPassword("");
      setConfirmPassword("");

      // Redirect to homepage after a brief delay
      setTimeout(() => {
        if (redirectPath) {
          window.location.href = `/?redirect=${redirectPath}`;
        } else {
          window.location.href = "/";
        }
      }, 1000);
    } catch (err: any) {
      setMessage({ text: err.message || "Failed to connect to server", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="relative w-full h-full flex-1">
      {/* Logo centered horizontally, top: 74px */}
      <div className="absolute top-[74px] left-1/2 -translate-x-1/2">
        <Image
          src="/assets/Group 45.svg"
          alt="Logo"
          width={104}
          height={64}
          priority
        />
      </div>

      {/* Assignment title text, top: 158px, width: 182px, font-size: 20px, weight: 700, centered */}
      <h1 className="absolute top-[158px] left-1/2 -translate-x-1/2 w-[182px] text-[20px] font-bold text-center leading-[26px] text-zinc-900 font-inter">
        Creative Upaay<br />Hiring Assignment
      </h1>

      {/* Switch Bar: top: 264px, width: 342px, height: 35px, border-radius: 5px, bg: #EBEBEB, no padding */}
      <div className="absolute top-[264px] left-1/2 -translate-x-1/2 w-[342px] h-[35px] bg-[#EBEBEB] rounded-[5px] flex">
        <button
          type="button"
          onClick={() => handleTabChange("login")}
          className={`flex-1 h-full flex items-center justify-center rounded-[5px] cursor-pointer transition-all duration-150 ${
            activeTab === "login"
              ? "bg-[#FFFFFF] text-zinc-950 font-bold text-[16px]"
              : "bg-[#EBEBEB] text-zinc-500 font-medium text-[16px]"
          }`}
        >
          Login
        </button>
        <button
          type="button"
          onClick={() => handleTabChange("signup")}
          className={`flex-1 h-full flex items-center justify-center rounded-[5px] cursor-pointer transition-all duration-150 ${
            activeTab === "signup"
              ? "bg-[#FFFFFF] text-zinc-950 font-bold text-[16px]"
              : "bg-[#EBEBEB] text-zinc-500 font-medium text-[16px]"
          }`}
        >
          Signup
        </button>
      </div>

      {/* Inputs Form Container: top: 347px, width: 342px */}
      <div className="absolute top-[347px] left-1/2 -translate-x-1/2 w-[342px] flex flex-col gap-[16px]">
        {activeTab === "login" ? (
          <>
            <input
              type="email"
              placeholder="Email ID"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              className="w-[342px] h-[41px] px-[10px] py-[10px] border-b border-[#C7C7C7] text-black placeholder-[#64748B] text-[14px] font-normal leading-[1.49] outline-none font-inter bg-transparent"
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              className="w-[342px] h-[41px] px-[10px] py-[10px] border-b border-[#C7C7C7] text-black placeholder-[#64748B] text-[14px] font-normal leading-[1.49] outline-none font-inter bg-transparent"
            />
          </>
        ) : (
          <>
            <input
              type="text"
              placeholder="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={loading}
              className="w-[342px] h-[41px] px-[10px] py-[10px] border-b border-[#C7C7C7] text-black placeholder-[#64748B] text-[14px] font-normal leading-[1.49] outline-none font-inter bg-transparent"
            />
            <input
              type="email"
              placeholder="Email ID"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              className="w-[342px] h-[41px] px-[10px] py-[10px] border-b border-[#C7C7C7] text-black placeholder-[#64748B] text-[14px] font-normal leading-[1.49] outline-none font-inter bg-transparent"
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              className="w-[342px] h-[41px] px-[10px] py-[10px] border-b border-[#C7C7C7] text-black placeholder-[#64748B] text-[14px] font-normal leading-[1.49] outline-none font-inter bg-transparent"
            />
            <input
              type="password"
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={loading}
              className="w-[342px] h-[41px] px-[10px] py-[10px] border-b border-[#C7C7C7] text-black placeholder-[#64748B] text-[14px] font-normal leading-[1.49] outline-none font-inter bg-transparent"
            />
          </>
        )}
      </div>

      {/* API Status Message Box */}
      {message && (
        <div
          className={`absolute top-[600px] left-1/2 -translate-x-1/2 w-[342px] text-center text-[13px] font-medium leading-tight ${
            message.type === "success" ? "text-emerald-600" : "text-rose-500"
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Submit Button: top: 650px, width: 345px, height: 37px, border-radius: 5px, bg: #4F46E5 */}
      <button
        type="submit"
        disabled={loading}
        className="absolute top-[650px] left-1/2 -translate-x-1/2 w-[345px] h-[37px] rounded-[5px] bg-[#4F46E5] text-[#FFFFFF] font-semibold text-[14px] flex items-center justify-center cursor-pointer font-inter hover:bg-[#4338ca] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? "Processing..." : activeTab === "login" ? "Login" : "Signup"}
      </button>
    </form>
  );
}
