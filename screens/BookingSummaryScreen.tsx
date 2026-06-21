"use client";

import Image from "next/image";

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

interface BookingSummaryScreenProps {
  movie: Movie;
  theater: Theater;
  selectedDate: string;
  selectedTime: string;
  selectedFormat: string;
  seats: string[];
  totalPrice: number;
  onBack: () => void;
  onCancel: () => void;
  onProceedToPayment: () => void;
}

export default function BookingSummaryScreen({
  movie,
  theater,
  selectedDate,
  selectedTime,
  selectedFormat,
  seats,
  totalPrice,
  onBack,
  onCancel,
  onProceedToPayment,
}: BookingSummaryScreenProps) {
  // Booking fee constant
  const bookingFee = 20;
  const grandTotal = totalPrice + bookingFee;

  // Format selected date logically: "Friday, October 10"
  const formatSelectedDate = (dateStr: string) => {
    try {
      const parsedStr = dateStr.includes("T") ? dateStr : `${dateStr}T00:00:00`;
      const date = new Date(parsedStr);
      const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
      const monthNames = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
      ];
      return `${dayNames[date.getDay()]}, ${monthNames[date.getMonth()]} ${date.getDate()}`;
    } catch (e) {
      return dateStr;
    }
  };

  const formattedDate = formatSelectedDate(selectedDate);

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

      {/* Filling Progress Bar: top 65px, left/right margins: 26px, 80% filled */}
      <div className="absolute top-[65px] left-[26px] right-[26px] h-[6px] bg-[#E7E7E7] rounded-full overflow-hidden">
        <div className="h-full bg-[#4F46E5] w-[80%] rounded-full" />
      </div>

      {/* Booking Summary Title: top 91px, left: 26px */}
      <h2 className="absolute top-[91px] left-[26px] text-[18px] font-bold text-zinc-900 font-inter leading-none">
        Booking Summary
      </h2>

      {/* Movie Banner: width 338px, height 192px, top 130px, left/right centered */}
      <div className="absolute top-[130px] left-1/2 -translate-x-1/2 w-[338px] h-[192px] rounded-[5px] overflow-hidden">
        <Image
          src="/assets/home/Hero Image.png"
          alt={movie.title}
          fill
          className="object-cover"
          priority
        />
      </div>

      {/* Movie Title: top 341px, left 26px */}
      <h1 className="absolute top-[341px] left-[26px] text-[20px] font-bold text-zinc-900 font-inter leading-none">
        {movie.title}
      </h1>

      {/* Theater & Date row: top 377px, left 26px */}
      <div className="absolute top-[377px] left-[26px] right-[26px] flex items-center gap-[16px] text-[#64748B] font-normal font-inter text-[14px] leading-none">
        {/* Theater Name with Vector-3.svg icon */}
        <div className="flex items-center gap-[6px]">
          <Image
            src="/assets/Vector-3.svg"
            alt="Theater"
            width={13}
            height={12}
            className="shrink-0"
          />
          <span>{theater.name}</span>
        </div>

        {/* Date with formkit_date.svg icon */}
        <div className="flex items-center gap-[6px]">
          <Image
            src="/assets/formkit_date.svg"
            alt="Date"
            width={14}
            height={14}
            className="shrink-0"
          />
          <span>{formattedDate}</span>
        </div>
      </div>

      {/* Screen, Time & Format Row: top 408px, left 26px */}
      <div className="absolute top-[408px] left-[26px] right-[26px] flex items-center gap-[16px] font-semibold text-[14px] font-inter leading-none">
        <span className="text-[#121212] w-[80px] shrink-0">Screen 1</span>
        <span className="text-[#64748B]">{selectedTime}</span>
        <span className="text-[#64748B]">{selectedFormat}</span>
      </div>

      {/* Seats Row: top 438px, left 26px */}
      <div className="absolute top-[438px] left-[26px] right-[26px] flex items-center gap-[16px] leading-none">
        <span className="font-semibold text-[14px] font-inter text-[#121212] w-[80px] shrink-0">
          Seats
        </span>
        <div className="flex flex-wrap gap-[6px]">
          {seats.map((seat) => (
            <span
              key={seat}
              className="bg-[#94A3B8] text-white font-semibold text-[12px] font-inter rounded-[5px] pt-[4px] pr-[8px] pb-[4px] pl-[8px] shrink-0"
            >
              {seat.replace("-", "")}
            </span>
          ))}
        </div>
      </div>

      {/* Bill section: top 499px, left-aligned in 70% area */}
      <div className="absolute top-[499px] left-[26px] w-[70%] flex flex-col gap-[10px]">
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

      {/* Straight Bar Divider: width 337px, top 551px, centered */}
      <div className="absolute top-[551px] left-1/2 -translate-x-1/2 w-[337px] border-b border-[#CED6E0]" />

      {/* Total Row: top 567px, left-aligned in 70% area */}
      <div className="absolute top-[567px] left-[26px] w-[70%] flex justify-between items-center text-[16px] font-bold text-[#121212] font-inter leading-none">
        <span>Total</span>
        <span>₹{grandTotal}</span>
      </div>

      {/* Proceed to Payment Button: top 686px */}
      <button
        onClick={onProceedToPayment}
        className="absolute top-[686px] left-1/2 -translate-x-1/2 w-[345px] h-[37px] rounded-[5px] bg-[#4F46E5] text-[#FFFFFF] font-semibold text-[14px] flex items-center justify-center cursor-pointer font-inter hover:bg-[#4338ca] transition-colors"
      >
        Proceed to Payment
      </button>
    </div>
  );
}
