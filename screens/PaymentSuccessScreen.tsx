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

interface PaymentSuccessScreenProps {
  movie: Movie;
  theater: Theater;
  selectedDate: string;
  selectedTime: string;
  selectedFormat: string;
  seats: string[];
  totalPrice: number;
  onClose: () => void;
}

export default function PaymentSuccessScreen({
  movie,
  theater,
  selectedDate,
  selectedTime,
  selectedFormat,
  seats,
  totalPrice,
  onClose,
}: PaymentSuccessScreenProps) {
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

  // Get current timestamp formatted as: 10/9/2023 10:45 AM
  const getTransactionDate = () => {
    const now = new Date();
    const day = now.getDate();
    const month = now.getMonth() + 1;
    const year = now.getFullYear();
    let hours = now.getHours();
    const minutes = now.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12;
    const minutesStr = minutes < 10 ? '0' + minutes : minutes;
    return `${month}/${day}/${year} ${hours}:${minutesStr} ${ampm}`;
  };

  const transactionDate = getTransactionDate();

  return (
    <div className="relative w-full h-full flex flex-col bg-[#F7F8FD]">
      {/* Close button: top 28px, right 26px */}
      <button
        onClick={onClose}
        className="absolute right-6.5 top-7 z-20 cursor-pointer text-[#64748B] font-normal text-[14px] font-inter"
      >
        Close
      </button>

      {/* Tick Icon: top 63px, centered */}
      <div className="absolute top-15.75 left-1/2 -translate-x-1/2 w-9.25 h-9.25">
        <Image
          src="/assets/mingcute_check-fill.svg"
          alt="Success"
          width={37}
          height={37}
        />
      </div>

      {/* Payment Successful Title: top 108px, centered */}
      <h2 className="absolute top-27 left-1/2 -translate-x-1/2 text-[14px] font-normal text-[#454545] font-inter text-center whitespace-nowrap">
        Payment Successful!
      </h2>

      {/* Ticket Card: top 148px, centered, width 322px */}
      <div className="absolute top-37 left-1/2 -translate-x-1/2 w-80.5 bg-white rounded-[5px] border border-[#D9D9D9] overflow-hidden flex flex-col">
        {/* Movie Banner Banner: width 322px, height 169px */}
        <div className="relative w-full h-42.25 shrink-0">
          <Image
            src="/assets/home/Hero Image.png"
            alt={movie.title}
            fill
            className="object-cover"
            priority
          />
        </div>

        {/* Details Box inside card */}
        <div className="p-4 flex flex-col w-full">
          {/* Movie Title: font Inter 700 Bold 16px */}
          <h3 className="text-[16px] font-bold text-[#121212] font-inter leading-none">
            {movie.title}
          </h3>

          {/* Theater & Screen & Format: (approx 20px gap) */}
          <div className="flex justify-between items-center mt-5 text-[14px] font-medium text-[#121212] font-inter leading-none">
            <span className="truncate pr-2">{theater.name}</span>
            <span className="shrink-0">Screen 1 - {selectedFormat}</span>
          </div>

          {/* Date & Time Row: (approx 14px gap) */}
          <div className="flex justify-between items-center mt-3.5 text-[14px] font-medium text-[#64748B] font-inter leading-none">
            <span>{formattedDate}</span>
            <span>{selectedTime}</span>
          </div>

          {/* Seats & Amount Paid Row: (approx 24px gap) */}
          <div className="flex justify-between items-start mt-6">
            {/* Seats Badges */}
            <div className="flex flex-col gap-1.5">
              <span className="text-[14px] font-medium text-[#64748B] font-inter leading-none">
                Seats:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {seats.map((seat) => (
                  <span
                    key={seat}
                    className="bg-[#64748B] text-white font-semibold text-[12px] font-inter rounded-[5px] pt-1 pr-2 pb-1 pl-2 shrink-0"
                  >
                    {seat.replace("-", "")}
                  </span>
                ))}
              </div>
            </div>

            {/* Total Paid amount */}
            <div className="flex flex-col items-end gap-1.5">
              <span className="text-[14px] font-medium text-[#64748B] font-inter leading-none">
                Amount Paid:
              </span>
              <span className="text-[16px] font-bold text-[#121212] font-inter leading-none">
                ₹{grandTotal}
              </span>
            </div>
          </div>

          {/* Transaction Info and QR Code Row: (approx 28px gap, no dotted line) */}
          <div className="flex justify-between items-end mt-7">
            {/* Transaction Date */}
            <div className="flex flex-col gap-1 text-[12px] text-[#64748B] font-inter leading-tight">
              <span>Transaction Date:</span>
              <span className="font-medium">{transactionDate}</span>
            </div>

            {/* QR Code Icon */}
            <div className="shrink-0 relative w-20 h-22">
              <Image
                src="/assets/1678237335 1.svg"
                alt="QR Code"
                fill
                className="object-contain"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Ticket Page Tip Text: top 680px */}
      <p className="absolute top-170 left-6.5 right-6.5 text-center text-[14px] font-normal text-[#64748B] font-inter leading-5">
        You may view all purchased tickets in the ticket page.
      </p>
    </div>
  );
}
