"use client";

import { useState, useRef } from "react";
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
  // We have rows from A to M (excluding I)
  const rows = ["A", "B", "C", "D", "E", "F", "G", "H", "J", "K", "L", "M"];
  
  // Base ticket price (logical calculation based on theater rates or default ₹280)
  const ticketPrice = 280;

  // Selected seats state: default J-9 and J-10 selected
  const [selectedSeats, setSelectedSeats] = useState<string[]>(["J-9", "J-10"]);

  // Occupied seats matching the screenshot
  const occupiedSeats = new Set([
    "H-7", "H-8", "H-9", "H-10",
    "J-11", "J-12"
  ]);

  // Drag-to-scroll states and references
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeftState, setScrollLeftState] = useState(0);

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
    const walk = (x - startX) * 1.5; // Drag sensitivity
    scrollRef.current.scrollLeft = scrollLeftState - walk;
  };

  const handleSeatClick = (seatId: string) => {
    if (occupiedSeats.has(seatId)) return; // Can't select occupied seats

    setSelectedSeats((prev) => {
      if (prev.includes(seatId)) {
        return prev.filter((id) => id !== seatId);
      } else {
        return [...prev, seatId];
      }
    });
  };

  const totalPrice = selectedSeats.length * ticketPrice;

  const renderSeatSet = (row: string, startCol: number, endCol: number) => {
    const seats = [];
    for (let col = startCol; col <= endCol; col++) {
      const seatId = `${row}-${col}`;
      const isOccupied = occupiedSeats.has(seatId);
      const isSelected = selectedSeats.includes(seatId);

      seats.push(
        <button
          key={seatId}
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
      );
    }
    return seats;
  };

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

      {/* Filling Progress Bar: top 65px, left/right margins: 26px, 60% filled */}
      <div className="absolute top-[65px] left-[26px] right-[26px] h-[6px] bg-[#E7E7E7] rounded-full overflow-hidden">
        <div className="h-full bg-[#4F46E5] w-[60%] rounded-full" />
      </div>

      {/* Select Seats Title: top 93px, left: 26px */}
      <h2 className="absolute top-[93px] left-[26px] text-[18px] font-bold text-zinc-900 font-inter leading-none">
        Select Seats
      </h2>

      {/* Screen, Time, Price details row: just under the title (top ~125px) */}
      <div className="absolute top-[125px] left-[26px] right-[26px] flex items-center justify-between">
        <div className="flex items-center gap-[8px] font-semibold text-[14px] font-inter">
          {/* Screen 1 text */}
          <span className="text-[#121212]">Screen 1</span>
          {/* Showtime text */}
          <span className="text-[#4F46E5]">{selectedTime}</span>
        </div>
        {/* Dynamic price */}
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

      {/* Seats scrollable and draggable container: top 220px, bottom 180px */}
      <div
        ref={scrollRef}
        onMouseDown={handleMouseDown}
        onMouseLeave={handleMouseLeave}
        onMouseUp={handleMouseUp}
        onMouseMove={handleMouseMove}
        className="absolute top-[220px] left-0 right-0 bottom-[180px] overflow-x-auto scrollbar-none flex flex-col select-none cursor-grab active:cursor-grabbing"
      >
        <div className="min-w-max flex flex-col pr-[26px]">
          {rows.map((row) => (
            <div key={row} className="flex flex-col shrink-0">
              {/* Vertical spacer/aisle before Row J */}
              {row === "J" && (
                <div className="h-[32px] shrink-0 flex">
                  <div className="w-[42px] h-full sticky left-0 bg-[#F7F8FD] z-10" />
                </div>
              )}

              {/* Row container with fixed height so letter backgrounds touch */}
              <div className="h-[28px] flex items-center shrink-0">
                {/* Sticky row letter span: h-full and w-[42px] to create a continuous solid strip */}
                <span className="h-full w-[42px] flex items-center text-[#121212] font-normal text-[14px] font-inter text-left shrink-0 sticky left-0 bg-[#F7F8FD] pl-[26px] z-10">
                  {row}
                </span>

                {/* Set 1: Seats 1-10 (offset from sticky strip using ml-[8px]) */}
                <div className="flex gap-[4px] ml-[8px]">
                  {renderSeatSet(row, 1, 10)}
                </div>

                {/* Aisle 1 */}
                <div className="w-[12px] shrink-0" />

                {/* Set 2: Seats 11-20 */}
                <div className="flex gap-[4px]">
                  {renderSeatSet(row, 11, 20)}
                </div>

                {/* Aisle 2 */}
                <div className="w-[12px] shrink-0" />

                {/* Set 3: Seats 21-30 */}
                <div className="flex gap-[4px]">
                  {renderSeatSet(row, 21, 30)}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Divider Bar: width 337px, top 647px */}
      <div className="absolute top-[647px] left-1/2 -translate-x-1/2 w-[337px] border-b border-[#CED6E0]" />

      {/* Legend Container: top 659px, left/right margins 26px */}
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
