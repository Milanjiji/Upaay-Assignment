"use client";

import { useState } from "react";
import Image from "next/image";

interface Movie {
  id: number;
  title: string;
  genre: string;
  rating: string;
}

interface Theater {
  id: number;
  name: string;
  location: string;
  rate: string;
}

interface CheckoutScreenProps {
  movie: Movie;
  theater: Theater;
  selectedDate: string;
  selectedTime: string;
  selectedFormat: string;
  seats: string[];
  totalPrice: number;
  onBack: () => void;
  onCancel: () => void;
  onCompletePayment: () => void;
}

export default function CheckoutScreen({
  movie,
  theater,
  selectedDate,
  selectedTime,
  selectedFormat,
  seats,
  totalPrice,
  onBack,
  onCancel,
  onCompletePayment,
}: CheckoutScreenProps) {
  const bookingFee = 20;
  const grandTotal = totalPrice + bookingFee;

  const [paymentMethod, setPaymentMethod] = useState<"card" | "wallet">("card");
  const [nameOnCard, setNameOnCard] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [cvc, setCvc] = useState("");
  const [saveDetails, setSaveDetails] = useState(false);

  return (
    <div className="relative w-full h-full flex flex-col bg-[#F7F8FD]">
      {/* Back button: top 28px, left 26px */}
      <button
        onClick={onBack}
        className="absolute left-[26px] top-[28px] z-20 cursor-pointer flex items-center gap-[8px] text-zinc-900 font-semibold text-[14px] font-inter"
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
        onClick={onCancel}
        className="absolute right-[26px] top-[28px] z-20 cursor-pointer text-zinc-900 font-semibold text-[14px] font-inter"
      >
        Cancel
      </button>

      {/* Filling Progress Bar: top 65px, left/right margins: 26px, 100% filled */}
      <div className="absolute top-[65px] left-[26px] right-[26px] h-[6px] bg-[#E7E7E7] rounded-full overflow-hidden">
        <div className="h-full bg-[#4F46E5] w-[100%] rounded-full" />
      </div>

      {/* Title Checkout: top 91px, left: 26px */}
      <h2 className="absolute top-[91px] left-[26px] text-[18px] font-bold text-zinc-900 font-inter leading-none">
        Checkout
      </h2>

      {/* Summary Section: top 142px, left 26px */}
      <h3 className="absolute top-[142px] left-[26px] text-[16px] font-bold text-zinc-900 font-inter leading-none">
        Summary
      </h3>

      {/* Bill section (matching booking summary): top 178px */}
      <div className="absolute top-[178px] left-[26px] w-[70%] flex flex-col gap-[10px]">
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
      <div className="absolute top-[235px] left-1/2 -translate-x-1/2 w-[337px] border-b border-[#CED6E0]" />

      {/* Total Row: top 251px, left 26px */}
      <div className="absolute top-[251px] left-[26px] w-[70%] flex justify-between items-center text-[16px] font-bold text-[#121212] font-inter leading-none">
        <span>Total</span>
        <span>₹{grandTotal}</span>
      </div>

      {/* Choose payment method: top 287px, left 26px */}
      <h3 className="absolute top-[287px] left-[26px] text-[16px] font-bold text-zinc-900 font-inter leading-none">
        Choose payment method
      </h3>

      {/* Payment methods selection row: top 323px, left 26px */}
      <div className="absolute top-[323px] left-[26px] right-[26px] flex items-center gap-[24px]">
        {/* Credit/Debit Card selector */}
        <button
          onClick={() => setPaymentMethod("card")}
          className="flex items-center gap-[8px] cursor-pointer"
        >
          {/* Custom radio button */}
          <div
            className={`w-[20px] h-[20px] rounded-full border-2 flex items-center justify-center transition-all ${
              paymentMethod === "card"
                ? "border-[#4F46E5]"
                : "border-[#CED6E0]"
            }`}
          >
            {paymentMethod === "card" && (
              <div className="w-[10px] h-[10px] rounded-full bg-[#4F46E5]" />
            )}
          </div>
          <span className="text-[14px] font-normal text-zinc-900 font-inter">
            Credit/Debit Card
          </span>
        </button>

        {/* Mobile Wallet selector */}
        <button
          onClick={() => setPaymentMethod("wallet")}
          className="flex items-center gap-[8px] cursor-pointer"
        >
          <div
            className={`w-[20px] h-[20px] rounded-full border-2 flex items-center justify-center transition-all ${
              paymentMethod === "wallet"
                ? "border-[#4F46E5]"
                : "border-[#CED6E0]"
            }`}
          >
            {paymentMethod === "wallet" && (
              <div className="w-[10px] h-[10px] rounded-full bg-[#4F46E5]" />
            )}
          </div>
          <span className="text-[14px] font-normal text-zinc-900 font-inter">
            Mobile Wallet
          </span>
        </button>
      </div>

      {/* Form Fields Section */}
      <div className="absolute top-[373px] left-[26px] right-[26px] flex flex-col">
        {paymentMethod === "card" ? (
          <div className="flex flex-col">
            {/* Name on Card */}
            <div className="flex flex-col gap-[8px]">
              <label className="text-[14px] font-normal text-zinc-900 font-inter leading-none">
                Name on card
              </label>
              <input
                type="text"
                placeholder="Name on card"
                value={nameOnCard}
                onChange={(e) => setNameOnCard(e.target.value)}
                className="w-[338px] h-[37px] bg-white border border-[#CED6E0] rounded-[5px] px-[12px] text-[14px] text-zinc-900 placeholder-[#64748B] font-inter focus:outline-none focus:border-[#4F46E5]"
              />
            </div>

            {/* Card Number */}
            <div className="flex flex-col gap-[8px] mt-[16px]">
              <label className="text-[14px] font-normal text-zinc-900 font-inter leading-none">
                Card number
              </label>
              <input
                type="text"
                placeholder="1234 5678 9012 3456"
                value={cardNumber}
                onChange={(e) => setCardNumber(e.target.value)}
                className="w-[338px] h-[37px] bg-white border border-[#CED6E0] rounded-[5px] px-[12px] text-[14px] text-zinc-900 placeholder-[#64748B] font-inter focus:outline-none focus:border-[#4F46E5]"
              />
            </div>

            {/* Expiry Date and CVC Row */}
            <div className="flex gap-[16px] mt-[16px]">
              {/* Expiry Date */}
              <div className="flex flex-col gap-[8px] w-[161px]">
                <label className="text-[14px] font-normal text-zinc-900 font-inter leading-none">
                  Expiry date
                </label>
                <input
                  type="text"
                  placeholder="MM/YY"
                  value={expiryDate}
                  onChange={(e) => setExpiryDate(e.target.value)}
                  className="w-full h-[37px] bg-white border border-[#CED6E0] rounded-[5px] px-[12px] text-[14px] text-zinc-900 placeholder-[#64748B] font-inter focus:outline-none focus:border-[#4F46E5]"
                />
              </div>

              {/* CVC/CVV */}
              <div className="flex flex-col gap-[8px] w-[161px]">
                <label className="text-[14px] font-normal text-zinc-900 font-inter leading-none">
                  CVC/CVV
                </label>
                <input
                  type="password"
                  placeholder="CVC"
                  maxLength={4}
                  value={cvc}
                  onChange={(e) => setCvc(e.target.value)}
                  className="w-full h-[37px] bg-white border border-[#CED6E0] rounded-[5px] px-[12px] text-[14px] text-zinc-900 placeholder-[#64748B] font-inter focus:outline-none focus:border-[#4F46E5]"
                />
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-[40px] text-center bg-white rounded-[5px] border border-[#CED6E0] w-[338px]">
            <span className="text-[14px] font-normal text-[#64748B] font-inter">
              Please enter your phone number at checkout.
            </span>
          </div>
        )}
      </div>

      {/* Save Payment Details Checkbox: top 639px, left 26px */}
      <button
        onClick={() => setSaveDetails(!saveDetails)}
        className="absolute top-[639px] left-[26px] flex items-center gap-[8px] cursor-pointer text-left focus:outline-none"
      >
        <div
          className={`w-[20px] h-[20px] rounded-[5px] border-2 flex items-center justify-center transition-all ${
            saveDetails
              ? "bg-[#4F46E5] border-[#4F46E5]"
              : "border-[#CED6E0]"
          }`}
        >
          {saveDetails && (
            <svg
              className="w-[12px] h-[12px] text-white fill-current"
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
        onClick={onCompletePayment}
        className="absolute top-[699px] left-1/2 -translate-x-1/2 w-[345px] h-[37px] rounded-[5px] bg-[#4F46E5] text-[#FFFFFF] font-semibold text-[14px] flex items-center justify-center cursor-pointer font-inter hover:bg-[#4338ca] transition-colors"
      >
        Complete Payment
      </button>
    </div>
  );
}
