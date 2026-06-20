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

  const [rows, setRows] = useState<string[]>([]);
  const [colsCount, setColsCount] = useState<number>(30);
  const [verticalAisles, setVerticalAisles] = useState<Set<number>>(new Set());
  const [horizontalAisles, setHorizontalAisles] = useState<Set<string>>(new Set());
  const [ticketPrice, setTicketPrice] = useState<number>(280);
  const [occupiedSeats, setOccupiedSeats] = useState<Set<string>>(new Set());
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);

  // Drag-to-scroll references
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeftState, setScrollLeftState] = useState(0);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";

  // Fetch showtime details and layouts using SWR
  const { data: showtime, isLoading: loading } = useSWR<any>(
    showtimeId ? `${API_URL}/api/showtimes/${showtimeId}` : null,
    fetcher
  );

  // Sync state when showtime data loads
  useEffect(() => {
    if (showtime) {
      const tConfig = showtime.theaterId;
      if (tConfig) {
        setRows(tConfig.rows || []);
        setColsCount(tConfig.colsCount || 30);
        setVerticalAisles(new Set(tConfig.verticalAisles || []));
        setHorizontalAisles(new Set(tConfig.horizontalAisles || []));
      }
      setTicketPrice(showtime.price || 280);

      const occupied = new Set<string>();
      (showtime.seats || []).forEach((s: any) => {
        if (s.status === "occupied") {
          occupied.add(s.seatNumber);
        }
      });
      setOccupiedSeats(occupied);
    }
  }, [showtime]);

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
        return [...prev, seatId];
      }
    });
  };

  const totalPrice = selectedSeats.length * ticketPrice;

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

      {/* Filling Progress Bar: top 65px, left/right margins: 26px */}
      <div className="absolute top-[65px] left-[26px] right-[26px] h-[6px] bg-[#E7E7E7] rounded-full overflow-hidden">
        <div className="h-full bg-[#4F46E5] w-[60%] rounded-full" />
      </div>

      {/* Select Seats Title: top 93px, left: 26px */}
      <h2 className="absolute top-[93px] left-[26px] text-[18px] font-bold text-zinc-900 font-inter leading-none">
        Select Seats
      </h2>

      {/* Screen, Time, Price details row */}
      <div className="absolute top-[125px] left-[26px] right-[26px] flex items-center justify-between">
        <div className="flex items-center gap-[8px] font-semibold text-[14px] font-inter">
          <span className="text-[#121212]">Screen 1</span>
          <span className="text-[#4F46E5]">{selectedTime}</span>
        </div>
        <span className="font-semibold text-[14px] font-inter text-[#1E1E1E]">
          ₹{totalPrice}
        </span>
      </div>

      {/* Curved Screen Image: top 166px, centered */}
      <div className="absolute top-[166px] left-1/2 -translate-x-1/2 w-[342px] h-[19px]">
        <Image
          src="/assets/Vector 1.svg"
          alt="Screen Curve"
          width={342}
          height={19}
        />
      </div>

      {/* SCREEN Text in caps: top 188px, centered */}
      <span className="absolute top-[188px] left-1/2 -translate-x-1/2 text-[14px] font-normal text-[#64748B] font-inter tracking-[0.2em]">
        SCREEN
      </span>

      {/* Seats scrollable container: top 220px, bottom 180px */}
      <div
        ref={scrollRef}
        onMouseDown={handleMouseDown}
        onMouseLeave={handleMouseLeave}
        onMouseUp={handleMouseUp}
        onMouseMove={handleMouseMove}
        className="absolute top-[220px] left-0 right-0 bottom-[180px] overflow-x-auto scrollbar-none flex flex-col select-none cursor-grab active:cursor-grabbing"
      >
        {loading ? (
          <div className="flex-1 w-full flex items-center justify-center text-[12px] text-zinc-500 font-inter font-medium py-[40px]">
            Loading layout...
          </div>
        ) : (
          <div className="min-w-max flex flex-col pr-[26px]">
            {rows.map((row) => (
              <div key={row} className="flex flex-col shrink-0">
                {/* Horizontal spacer/aisle before this row */}
                {horizontalAisles.has(row) && (
                  <div className="h-[32px] shrink-0 flex">
                    <div className="w-[42px] h-full sticky left-0 bg-[#F7F8FD] z-10" />
                  </div>
                )}

                {/* Row container */}
                <div className="h-[28px] flex items-center shrink-0">
                  <span className="h-full w-[42px] flex items-center text-[#121212] font-normal text-[14px] font-inter text-left shrink-0 sticky left-0 bg-[#F7F8FD] pl-[26px] z-10">
                    {row}
                  </span>

                  {/* Dynamic Seat Loops with customizable aisles */}
                  <div className="flex gap-[4px] ml-[8px] items-center">
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
                            className={`w-[23px] h-[23px] rounded-[5px] border flex items-center justify-center font-semibold text-[10px] font-inter transition-all duration-150 shrink-0 ${
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
                            <div className="w-[12px] shrink-0" />
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Divider Bar: width 337px, top 647px */}
      <div className="absolute top-[647px] left-1/2 -translate-x-1/2 w-[337px] border-b border-[#CED6E0]" />

      {/* Legend Container: top 659px */}
      <div className="absolute top-[659px] left-[26px] right-[26px] flex items-center justify-center gap-[24px]">
        {/* Available */}
        <div className="flex items-center gap-[6px]">
          <div className="w-[17px] h-[17px] rounded-[5px] border border-[#CED6E0] bg-[#F7F8FD] shrink-0" />
          <span className="text-[14px] font-normal text-[#64748B] font-inter">
            Available
          </span>
        </div>

        {/* Occupied */}
        <div className="flex items-center gap-[6px]">
          <div className="w-[17px] h-[17px] rounded-[5px] border border-[#94A3B8] bg-[#94A3B8] shrink-0" />
          <span className="text-[14px] font-normal text-[#64748B] font-inter">
            Occupied
          </span>
        </div>

        {/* Selected */}
        <div className="flex items-center gap-[6px]">
          <div className="w-[17px] h-[17px] rounded-[5px] border border-[#4F46E5] bg-[#4F46E5] shrink-0" />
          <span className="text-[14px] font-normal text-[#64748B] font-inter">
            Selected
          </span>
        </div>
      </div>

      {/* View Booking Summary Button: top 700px */}
      <button
        onClick={() => onConfirmBooking(selectedSeats, totalPrice)}
        disabled={selectedSeats.length === 0}
        className={`absolute top-[700px] left-1/2 -translate-x-1/2 w-[345px] h-[37px] rounded-[5px] font-semibold text-[14px] flex items-center justify-center cursor-pointer font-inter transition-all ${
          selectedSeats.length === 0
            ? "bg-zinc-300 text-zinc-500 cursor-not-allowed"
            : "bg-[#4F46E5] text-[#FFFFFF] hover:bg-[#4338ca]"
        }`}
      >
        View Booking Summary
      </button>
    </div>
  );
}
