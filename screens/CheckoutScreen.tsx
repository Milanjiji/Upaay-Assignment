"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useSelector } from "react-redux";
import { RootState } from "@/store";

interface Movie {
  _id: string;
  title: string;
  genre: string;
  rating: number;
}

interface Theater {
  _id: string;
  name: string;
  location: string;
  rateRange: string;
}

interface CheckoutScreenProps {
  movie: Movie;
  theater: Theater;
  selectedDate: string;
  selectedTime: string;
  selectedFormat: string;
  seats: string[];
  totalPrice: number;
  isBooking?: boolean;
  onBack: () => void;
  onCancel: () => void;
  onCompletePayment: (cardDetails?: { nameOnCard: string; cardNumber: string }) => void;
}

export default function CheckoutScreen({
  movie,
  theater,
  selectedDate,
  selectedTime,
  selectedFormat,
  seats,
  totalPrice,
  isBooking = false,
  onBack,
  onCancel,
  onCompletePayment,
}: CheckoutScreenProps) {
  const showtimeId = useSelector((state: RootState) => state.booking.selectedShowtimeId);
  const reduxToken = useSelector((state: RootState) => state.auth.token);
  const getCookieToken = () => {
    if (typeof document === "undefined") return "";
    const cookies = document.cookie.split(";");
    const tokenCookie = cookies.find(c => c.trim().startsWith("token="));
    return tokenCookie ? tokenCookie.split("=")[1] : "";
  };
  const token = reduxToken || getCookieToken();

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";

  const handleReleaseAndNavigate = async (navigateCallback: () => void) => {
    try {
      await fetch(`${API_URL}/api/showtimes/${showtimeId}/release`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": token || "",
        },
        body: JSON.stringify({ seats }),
      });
    } catch (err) {
      console.error("Failed to release seats hold in background:", err);
    }
    navigateCallback();
  };

  const bookingFee = 20;
  const grandTotal = totalPrice + bookingFee;

  const [paymentMethod, setPaymentMethod] = useState<"card" | "wallet">("card");
  const [nameOnCard, setNameOnCard] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [cvc, setCvc] = useState("");
  const [walletPhone, setWalletPhone] = useState("");
  const [saveDetails, setSaveDetails] = useState(false);

  // Load saved card details on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem("upaay_saved_card");
      if (saved) {
        const parsed = JSON.parse(saved);
        setNameOnCard(parsed.nameOnCard || "");
        setCardNumber(parsed.cardNumber || "");
        setExpiryDate(parsed.expiryDate || "");
        setCvc(parsed.cvc || "");
        setSaveDetails(true);
      }
    } catch (e) {
      console.error("Failed to load saved card details", e);
    }
  }, []);

  const handlePaymentSubmit = () => {
    if (paymentMethod === "card") {
      if (!nameOnCard.trim()) {
        alert("Invalid input: Name on card cannot be empty.");
        return;
      }
      
      const strippedCardNumber = cardNumber.replace(/\s+/g, "");
      if (!/^\d{16}$/.test(strippedCardNumber)) {
        alert("Invalid input: Card number must be exactly 16 digits.");
        return;
      }

      if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(expiryDate)) {
        alert("Invalid input: Expiry date must be in MM/YY format.");
        return;
      }

      if (!/^\d{3,4}$/.test(cvc)) {
        alert("Invalid input: CVC/CVV must be 3 or 4 digits.");
        return;
      }

      if (strippedCardNumber === "0000000000000000") {
        alert("Payment Declined");
        return;
      }

      try {
        if (saveDetails) {
          localStorage.setItem(
            "upaay_saved_card",
            JSON.stringify({ nameOnCard, cardNumber, expiryDate, cvc })
          );
        } else {
          localStorage.removeItem("upaay_saved_card");
        }
      } catch (e) {
        console.error("Failed to save card details", e);
      }
    } else {
      const strippedPhone = walletPhone.replace(/\D/g, "");
      if (!/^\d{10}$/.test(strippedPhone)) {
        alert("Invalid input: Phone number must be exactly 10 digits.");
        return;
      }
    }

    onCompletePayment({ nameOnCard, cardNumber });
  };

  return (
    <div className="relative w-full h-full flex flex-col bg-[#F7F8FD]">
      {/* Back button: top 28px, left 26px */}
      <button
        onClick={() => handleReleaseAndNavigate(onBack)}
        className="absolute left-6.5 top-7 z-20 cursor-pointer flex items-center gap-2 text-zinc-900 font-semibold text-[14px] font-inter"
      >
        <Image
          src="/assets/ep_back.svg"
          alt="Back"
          width={21}
          height={21}
          className="invert"
        />
        Back
      </button>

      {/* Cancel button: top 28px, right 26px */}
      <button
        onClick={() => handleReleaseAndNavigate(onCancel)}
        className="absolute right-6.5 top-7 z-20 cursor-pointer text-zinc-900 font-semibold text-[14px] font-inter"
      >
        Cancel
      </button>

      {/* Filling Progress Bar: top 65px, left/right margins: 26px, 100% filled */}
      <div className="absolute top-16.25 left-6.5 right-6.5 h-1.5 bg-[#E7E7E7] rounded-full overflow-hidden">
        <div className="h-full bg-[#4F46E5] w-full rounded-full" />
      </div>

      {/* Title Checkout: top 91px, left: 26px */}
      <h2 className="absolute top-22.75 left-6.5 text-[18px] font-bold text-zinc-900 font-inter leading-none">
        Checkout
      </h2>

      {/* Summary Section: top 142px, left 26px */}
      <h3 className="absolute top-35.5 left-6.5 text-[16px] font-bold text-zinc-900 font-inter leading-none">
        Summary
      </h3>

      {/* Bill section (matching booking summary): top 178px */}
      <div className="absolute top-44.5 left-6.5 w-[70%] flex flex-col gap-2.5">
        {/* Ticket cost row */}
        <div className="flex justify-between items-center text-[14px] font-normal text-[#121212] font-inter leading-none">
          <span>{seats.length}x Tickets</span>
          <span>₹{totalPrice}</span>
        </div>

        {/* Booking fee row */}
        <div className="flex justify-between items-center text-[14px] font-normal text-[#121212] font-inter leading-none">
          <span>Booking Fee</span>
          <span>₹{bookingFee}</span>
        </div>
      </div>

      {/* Divider Bar: width 337px, top 235px, centered */}
      <div className="absolute top-58.75 left-1/2 -translate-x-1/2 w-84.25 border-b border-[#CED6E0]" />

      {/* Total Row: top 251px, left 26px */}
      <div className="absolute top-62.75 left-6.5 w-[70%] flex justify-between items-center text-[16px] font-bold text-[#121212] font-inter leading-none">
        <span>Total</span>
        <span>₹{grandTotal}</span>
      </div>

      {/* Choose payment method: top 287px, left 26px */}
      <h3 className="absolute top-71.75 left-6.5 text-[16px] font-bold text-zinc-900 font-inter leading-none">
        Choose payment method
      </h3>

      {/* Payment methods selection row: top 323px, left 26px */}
      <div className="absolute top-80.75 left-6.5 right-6.5 flex items-center gap-6">
        {/* Credit/Debit Card selector */}
        <button
          onClick={() => setPaymentMethod("card")}
          className="flex items-center gap-2 cursor-pointer"
        >
          {/* Custom radio button */}
          <div
            className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
              paymentMethod === "card"
                ? "border-[#4F46E5]"
                : "border-[#CED6E0]"
            }`}
          >
            {paymentMethod === "card" && (
              <div className="w-2.5 h-2.5 rounded-full bg-[#4F46E5]" />
            )}
          </div>
          <span className="text-[14px] font-normal text-zinc-900 font-inter">
            Credit/Debit Card
          </span>
        </button>

        {/* Mobile Wallet selector */}
        <button
          onClick={() => setPaymentMethod("wallet")}
          className="flex items-center gap-2 cursor-pointer"
        >
          <div
            className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
              paymentMethod === "wallet"
                ? "border-[#4F46E5]"
                : "border-[#CED6E0]"
            }`}
          >
            {paymentMethod === "wallet" && (
              <div className="w-2.5 h-2.5 rounded-full bg-[#4F46E5]" />
            )}
          </div>
          <span className="text-[14px] font-normal text-zinc-900 font-inter">
            Mobile Wallet
          </span>
        </button>
      </div>

      {/* Form Fields Section */}
      <div className="absolute top-93.25 left-6.5 right-6.5 flex flex-col">
        {paymentMethod === "card" ? (
          <div className="flex flex-col">
            {/* Name on Card */}
            <div className="flex flex-col gap-2">
              <label className="text-[14px] font-normal text-zinc-900 font-inter leading-none">
                Name on card
              </label>
              <input
                type="text"
                placeholder="Name on card"
                value={nameOnCard}
                onChange={(e) => setNameOnCard(e.target.value)}
                className="w-84.5 h-9.25 bg-white border border-[#CED6E0] rounded-[5px] px-3 text-[14px] text-zinc-900 placeholder-[#64748B] font-inter focus:outline-none focus:border-[#4F46E5]"
              />
            </div>

            {/* Card Number */}
            <div className="flex flex-col gap-2 mt-4">
              <label className="text-[14px] font-normal text-zinc-900 font-inter leading-none">
                Card number
              </label>
              <input
                type="text"
                placeholder="1234 5678 9012 3456"
                value={cardNumber}
                onChange={(e) => setCardNumber(e.target.value)}
                className="w-84.5 h-9.25 bg-white border border-[#CED6E0] rounded-[5px] px-3 text-[14px] text-zinc-900 placeholder-[#64748B] font-inter focus:outline-none focus:border-[#4F46E5]"
              />
            </div>

            {/* Expiry Date and CVC Row */}
            <div className="flex gap-4 mt-4">
              {/* Expiry Date */}
              <div className="flex flex-col gap-2 w-40.25">
                <label className="text-[14px] font-normal text-zinc-900 font-inter leading-none">
                  Expiry date
                </label>
                <input
                  type="text"
                  placeholder="MM/YY"
                  value={expiryDate}
                  onChange={(e) => setExpiryDate(e.target.value)}
                  className="w-full h-9.25 bg-white border border-[#CED6E0] rounded-[5px] px-3 text-[14px] text-zinc-900 placeholder-[#64748B] font-inter focus:outline-none focus:border-[#4F46E5]"
                />
              </div>

              {/* CVC/CVV */}
              <div className="flex flex-col gap-2 w-40.25">
                <label className="text-[14px] font-normal text-zinc-900 font-inter leading-none">
                  CVC/CVV
                </label>
                <input
                  type="password"
                  placeholder="CVC"
                  maxLength={4}
                  value={cvc}
                  onChange={(e) => setCvc(e.target.value)}
                  className="w-full h-9.25 bg-white border border-[#CED6E0] rounded-[5px] px-3 text-[14px] text-zinc-900 placeholder-[#64748B] font-inter focus:outline-none focus:border-[#4F46E5]"
                />
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col">
            <div className="flex flex-col gap-2">
              <label className="text-[14px] font-normal text-zinc-900 font-inter leading-none">
                Phone number
              </label>
              <input
                type="tel"
                placeholder="10-digit mobile number"
                value={walletPhone}
                onChange={(e) => setWalletPhone(e.target.value)}
                className="w-84.5 h-9.25 bg-white border border-[#CED6E0] rounded-[5px] px-3 text-[14px] text-zinc-900 placeholder-[#64748B] font-inter focus:outline-none focus:border-[#4F46E5]"
              />
            </div>
          </div>
        )}
      </div>

      {/* Save Payment Details Checkbox: top 639px, left 26px */}
      <button
        onClick={() => setSaveDetails(!saveDetails)}
        className="absolute top-159.75 left-6.5 flex items-center gap-2 cursor-pointer text-left focus:outline-none"
      >
        <div
          className={`w-5 h-5 rounded-[5px] border-2 flex items-center justify-center transition-all ${
            saveDetails
              ? "bg-[#4F46E5] border-[#4F46E5]"
              : "border-[#CED6E0]"
          }`}
        >
          {saveDetails && (
            <svg
              className="w-3 h-3 text-white fill-current"
              viewBox="0 0 20 20"
            >
              <path d="M0 11l2-2 5 5L18 3l2 2L7 18z" />
            </svg>
          )}
        </div>
        <span className="text-[14px] font-normal text-[#121212] font-inter">
          Save payment details for the next purchase
        </span>
      </button>

      {/* Complete Payment Button: top 699px */}
      <button
        disabled={isBooking}
        onClick={handlePaymentSubmit}
        className={`absolute top-174.75 left-1/2 -translate-x-1/2 w-86.25 h-9.25 rounded-[5px] bg-[#4F46E5] text-[#FFFFFF] font-semibold text-[14px] flex items-center justify-center cursor-pointer font-inter hover:bg-[#4338ca] transition-colors ${
          isBooking ? "opacity-60 cursor-not-allowed" : ""
        }`}
      >
        {isBooking ? (
          <div className="flex items-center gap-2">
            <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            Processing...
          </div>
        ) : (
          "Complete Payment"
        )}
      </button>
    </div>
  );
}
