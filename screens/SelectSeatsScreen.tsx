"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import useSWR from "swr";
import { fetcher } from "@/store/fetcher";

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

interface SelectSeatsScreenProps {
  movie: Movie;
  theater: Theater;
  selectedDate: string;
  selectedTime: string;
  selectedFormat: string;
  onBack: () => void;
  onCancel: () => void;
  onConfirmBooking: (seats: string[], totalPrice: number) => void;
}

export default function SelectSeatsScreen({
  movie,
  theater,
  selectedDate,
  selectedTime,
  selectedFormat,
  onBack,
  onCancel,
  onConfirmBooking,
}: SelectSeatsScreenProps) {
  const showtimeId = useSelector((state: RootState) => state.booking.selectedShowtimeId);

  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isHolding, setIsHolding] = useState(false);

  const reduxToken = useSelector((state: RootState) => state.auth.token);
  const getCookieToken = () => {
    if (typeof document === "undefined") return "";
    const cookies = document.cookie.split(";");
    const tokenCookie = cookies.find(c => c.trim().startsWith("token="));
    return tokenCookie ? tokenCookie.split("=")[1] : "";
  };
  const token = reduxToken || getCookieToken();

  // Drag-to-scroll references
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeftState, setScrollLeftState] = useState(0);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";

  // Fetch showtime details and layouts using SWR with 5-second polling interval
  const { data: showtime, error, isLoading, isValidating, mutate } = useSWR<any>(
    showtimeId ? `${API_URL}/api/showtimes/${showtimeId}` : null,
    fetcher,
    { refreshInterval: 5000 }
  );

  // Sync isInitialLoading state when showtime details fetch and validate completes
  useEffect(() => {
    if (showtime && !isValidating) {
      setIsInitialLoading(false);
    }
  }, [showtime, isValidating]);

  // Derive layout options and occupancy details directly from showtime payload
  const rows: string[] = showtime?.theaterId?.rows || [];
  const colsCount = showtime?.theaterId?.colsCount || 30;
  const verticalAisles = new Set<number>(showtime?.theaterId?.verticalAisles || []);
  const horizontalAisles = new Set<string>(showtime?.theaterId?.horizontalAisles || []);
  const ticketPrice = showtime?.price || 280;

  const occupiedSeats = new Set<string>();
  if (showtime?.seats) {
    showtime.seats.forEach((s: any) => {
      if (s.status === "occupied") {
        occupiedSeats.add(s.seatNumber);
      }
    });
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!scrollRef.current) return;
    setIsDragging(true);
    setStartX(e.pageX - scrollRef.current.offsetLeft);
    setScrollLeftState(scrollRef.current.scrollLeft);
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !scrollRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX) * 1.5;
    scrollRef.current.scrollLeft = scrollLeftState - walk;
  };

  const handleSeatClick = (seatId: string) => {
    if (occupiedSeats.has(seatId)) return;

    setSelectedSeats((prev) => {
      if (prev.includes(seatId)) {
        return prev.filter((id) => id !== seatId);
      } else {
        if (prev.length >= 10) {
          alert("You can select a maximum of 10 seats per transaction.");
          return prev;
        }
        return [...prev, seatId];
      }
    });
  };

  const totalPrice = selectedSeats.length * ticketPrice;

  const handleConfirmSummaryClick = async () => {
    if (selectedSeats.length === 0 || isHolding) return;
    setIsHolding(true);
    
    try {
      const res = await fetch(`${API_URL}/api/showtimes/${showtimeId}/hold`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": token || "",
        },
        body: JSON.stringify({ seats: selectedSeats }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || "Some seats were just held by another customer. Please choose other seats.");
      }

      // Success - proceed to booking summary/checkout
      onConfirmBooking(selectedSeats, totalPrice);
    } catch (err: any) {
      alert(err.message || "Failed to hold seats. Please try selecting other seats.");
      // Refresh seat matrix immediately
      mutate();
    } finally {
      setIsHolding(false);
    }
  };

  return (
    <div className="relative w-full h-full flex flex-col bg-[#F7F8FD]">
      {/* Back button: top 28px, left 26px */}
      <button
        onClick={onBack}
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
        onClick={onCancel}
        className="absolute right-6.5 top-7 z-20 cursor-pointer text-zinc-900 font-semibold text-[14px] font-inter"
      >
        Cancel
      </button>

      {isInitialLoading ? (
        <div className="flex-1 w-full flex flex-col items-center justify-center py-30">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-[#4F46E5] mb-3" />
          <span className="text-[14px] font-medium text-[#64748B] font-inter">Loading layout...</span>
        </div>
      ) : (
        <>
          {/* Filling Progress Bar: top 65px, left/right margins: 26px */}
          <div className="absolute top-16.25 left-6.5 right-6.5 h-1.5 bg-[#E7E7E7] rounded-full overflow-hidden">
            <div className="h-full bg-[#4F46E5] w-[60%] rounded-full" />
          </div>

          {/* Select Seats Title: top 93px, left: 26px */}
          <h2 className="absolute top-23.25 left-6.5 text-[18px] font-bold text-zinc-900 font-inter leading-none">
            Select Seats
          </h2>

          {/* Screen, Time, Price details row */}
          <div className="absolute top-31.25 left-6.5 right-6.5 flex items-center justify-between">
            <div className="flex items-center gap-2 font-semibold text-[14px] font-inter">
              <span className="text-[#121212]">Screen 1</span>
              <span className="text-[#4F46E5]">{selectedTime}</span>
            </div>
            <span className="font-semibold text-[14px] font-inter text-[#1E1E1E]">
              ₹{totalPrice}
            </span>
          </div>

          {/* Curved Screen Image: top 166px, centered */}
          <div className="absolute top-41.5 left-1/2 -translate-x-1/2 w-85.5 h-4.75">
            <Image
              src="/assets/Vector 1.svg"
              alt="Screen Curve"
              width={342}
              height={19}
            />
          </div>

          {/* SCREEN Text in caps: top 188px, centered */}
          <span className="absolute top-47 left-1/2 -translate-x-1/2 text-[14px] font-normal text-[#64748B] font-inter tracking-[0.2em]">
            SCREEN
          </span>

          {/* Seats scrollable container: top 220px, bottom 180px */}
          <div
            ref={scrollRef}
            onMouseDown={handleMouseDown}
            onMouseLeave={handleMouseLeave}
            onMouseUp={handleMouseUp}
            onMouseMove={handleMouseMove}
            className="absolute top-55 left-0 right-0 bottom-45 overflow-x-auto scrollbar-none flex flex-col select-none cursor-grab active:cursor-grabbing"
          >
            <div className="min-w-max flex flex-col pr-6.5">
              {rows.map((row) => (
                <div key={row} className="flex flex-col shrink-0">
                  {/* Horizontal spacer/aisle before this row */}
                  {horizontalAisles.has(row) && (
                    <div className="h-8 shrink-0 flex">
                      <div className="w-10.5 h-full sticky left-0 bg-[#F7F8FD] z-10" />
                    </div>
                  )}

                  {/* Row container */}
                  <div className="h-7 flex items-center shrink-0">
                    <span className="h-full w-10.5 flex items-center text-[#121212] font-normal text-[14px] font-inter text-left shrink-0 sticky left-0 bg-[#F7F8FD] pl-6.5 z-10">
                      {row}
                    </span>

                    {/* Dynamic Seat Loops with customizable aisles */}
                    <div className="flex gap-1 ml-2 items-center">
                      {Array.from({ length: colsCount }).map((_, idx) => {
                        const col = idx + 1;
                        const seatId = `${row}-${col}`;
                        const isOccupied = occupiedSeats.has(seatId);
                        const isSelected = selectedSeats.includes(seatId);

                        return (
                          <div key={seatId} className="flex items-center shrink-0">
                            <button
                              type="button"
                              onClick={() => handleSeatClick(seatId)}
                              disabled={isOccupied}
                              className={`w-5.75 h-5.75 rounded-[5px] border flex items-center justify-center font-semibold text-[10px] font-inter transition-all duration-150 shrink-0 ${
                                isOccupied
                                  ? "bg-[#94A3B8] border-[#94A3B8] text-white cursor-not-allowed"
                                  : isSelected
                                  ? "bg-[#4F46E5] border-[#4F46E5] text-white cursor-pointer"
                                  : "bg-[#F7F8FD] border-[#CED6E0] text-[#64748B] cursor-pointer hover:bg-zinc-100"
                              }`}
                            >
                              {col}
                            </button>
                            {verticalAisles.has(col) && (
                              <div className="w-3 shrink-0" />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Divider Bar: width 337px, top 647px */}
          <div className="absolute top-161.75 left-1/2 -translate-x-1/2 w-84.25 border-b border-[#CED6E0]" />

          {/* Legend Container: top 659px */}
          <div className="absolute top-164.75 left-6.5 right-6.5 flex items-center justify-center gap-6">
            {/* Available */}
            <div className="flex items-center gap-1.5">
              <div className="w-4.25 h-4.25 rounded-[5px] border border-[#CED6E0] bg-[#F7F8FD] shrink-0" />
              <span className="text-[14px] font-normal text-[#64748B] font-inter">
                Available
              </span>
            </div>

            {/* Occupied */}
            <div className="flex items-center gap-1.5">
              <div className="w-4.25 h-4.25 rounded-[5px] border border-[#94A3B8] bg-[#94A3B8] shrink-0" />
              <span className="text-[14px] font-normal text-[#64748B] font-inter">
                Occupied
              </span>
            </div>

            {/* Selected */}
            <div className="flex items-center gap-1.5">
              <div className="w-4.25 h-4.25 rounded-[5px] border border-[#4F46E5] bg-[#4F46E5] shrink-0" />
              <span className="text-[14px] font-normal text-[#64748B] font-inter">
                Selected
              </span>
            </div>
          </div>

          {/* View Booking Summary Button: top 700px */}
          <button
            onClick={handleConfirmSummaryClick}
            disabled={selectedSeats.length === 0 || isHolding}
            className={`absolute top-175 left-1/2 -translate-x-1/2 w-86.25 h-9.25 rounded-[5px] font-semibold text-[14px] flex items-center justify-center cursor-pointer font-inter transition-all ${
              selectedSeats.length === 0 || isHolding
                ? "bg-zinc-300 text-zinc-500 cursor-not-allowed"
                : "bg-[#4F46E5] text-[#FFFFFF] hover:bg-[#4338ca]"
            }`}
          >
            {isHolding ? (
              <div className="flex items-center gap-2">
                <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Locking Seats...
              </div>
            ) : (
              "View Booking Summary"
            )}
          </button>
        </>
      )}
    </div>
  );
}
