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

interface SelectScheduleScreenProps {
  movie: Movie;
  theater: Theater;
  selectedDate: string;
  onBack: () => void;
  onCancel: () => void;
  onGetTickets: (selectedFormat: string, selectedTime: string) => void;
}

export default function SelectScheduleScreen({
  movie,
  theater,
  selectedDate,
  onBack,
  onCancel,
  onGetTickets,
}: SelectScheduleScreenProps) {
  const [selectedFormat, setSelectedFormat] = useState<string>("2D");
  const [selectedTime, setSelectedTime] = useState<string>("10:00 AM");

  // Format selection options
  const formats = ["2D", "3D"];

  // Time selection options for Screen 1
  const times = ["10:00 AM", "12:00 PM", "2:00 PM", "4:00 PM", "6:00 PM", "8:00 PM"];

  // Format selected date logically: "Friday, October 10"
  const formatSelectedDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
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
      {/* Hero Banner Section: height 173px */}
      <div className="relative w-full h-[173px] shrink-0">
        <Image
          src="/assets/home/Hero Image.png"
          alt={movie.title}
          fill
          className="object-cover"
          priority
        />
        {/* Title and metadata inside hero banner: top 98px */}
        <div className="absolute top-[98px] left-[26px] right-[26px] z-10 flex flex-col">
          <h1 className="text-[20px] font-bold text-white font-inter leading-tight">
            {movie.title}
          </h1>
          
          {/* Metadata Row: Theater Name & Date */}
          <div className="flex items-center gap-[12px] mt-[6px] text-white font-normal font-inter text-[14px] leading-none opacity-90">
            {/* Theater Name with building icon */}
            <div className="flex items-center gap-[4px]">
              <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor" className="shrink-0">
                <path d="M2 1a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1H2zm1 2h3v2H3V3zm0 4h3v2H3V7zm0 4h3v2H3v-2zm10 2H10v-2h3v2zm0-4H10V7h3v2zm0-4H10V3h3v2z"/>
              </svg>
              <span>{theater.name}</span>
            </div>

            {/* Date with formkit_date.svg icon */}
            <div className="flex items-center gap-[4px]">
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
        </div>
      </div>

      {/* Back button: top 28px, left 26px */}
      <button
        onClick={onBack}
        className="absolute left-[26px] top-[28px] z-20 cursor-pointer flex items-center gap-[8px] text-white font-semibold text-[14px] font-inter"
      >
        <Image
          src="/assets/ep_back.svg"
          alt="Back"
          width={21}
          height={21}
        />
        Back
      </button>

      {/* Cancel button: top 28px, right 26px */}
      <button
        onClick={onCancel}
        className="absolute right-[26px] top-[28px] z-20 cursor-pointer text-white font-semibold text-[14px] font-inter"
      >
        Cancel
      </button>

      {/* Filling Progress Bar: top 191px, left/right margins: 26px, 40% filled */}
      <div className="absolute top-[191px] left-[26px] right-[26px] h-[6px] bg-[#E7E7E7] rounded-full overflow-hidden">
        <div className="h-full bg-[#4F46E5] w-[40%] rounded-full" />
      </div>

      {/* Choose Schedule Title: top 215px, left: 26px */}
      <h2 className="absolute top-[215px] left-[26px] text-[18px] font-bold text-zinc-900 font-inter leading-none">
        Choose Schedule
      </h2>

      {/* Format Row: top 267px, left/right margins 26px */}
      <div className="absolute top-[267px] left-[26px] right-[26px] flex items-center justify-between">
        <div className="flex items-center gap-[16px]">
          {/* Format Title */}
          <span className="text-[14px] font-semibold text-zinc-900 font-inter">
            Format
          </span>

          {/* Format boxes */}
          <div className="flex gap-[8px]">
            {formats.map((fmt) => {
              const isSelected = selectedFormat === fmt;
              return (
                <button
                  key={fmt}
                  onClick={() => setSelectedFormat(fmt)}
                  className={`w-[28px] h-[28px] rounded-[5px] border flex items-center justify-center font-semibold text-[12px] font-inter cursor-pointer transition-all duration-150 ${
                    isSelected
                      ? "bg-[#4F46E5] text-white border-[#4F46E5]"
                      : "bg-[#F7F8FD] text-[#64748B] border-[#CED6E0]"
                  }`}
                >
                  {fmt}
                </button>
              );
            })}
          </div>
        </div>

        {/* Rate range */}
        <span className="text-[14px] font-semibold text-[#64748B] font-inter">
          {theater.rate}
        </span>
      </div>

      {/* Divider Bar: width 337px, top 311px */}
      <div className="absolute top-[311px] left-1/2 -translate-x-1/2 w-[337px] border-b border-[#CED6E0]" />

      {/* Screen 1 Title: top 331px, left 26px */}
      <h3 className="absolute top-[331px] left-[26px] text-[14px] font-semibold text-zinc-900 font-inter leading-none">
        Screen 1
      </h3>

      {/* Screen boxes (Times): top 360px, left/right margins 26px, max 3 per row, tight spacing */}
      <div className="absolute top-[360px] left-[26px] right-[26px] grid grid-cols-3 gap-[12px] w-fit">
        {times.map((t) => {
          const isSelected = selectedTime === t;
          return (
            <button
              key={t}
              onClick={() => setSelectedTime(t)}
              className={`px-[10px] h-[32px] w-full rounded-[5px] border flex items-center justify-center font-semibold text-[12px] font-inter cursor-pointer transition-all duration-150 ${
                isSelected
                  ? "bg-[#4F46E5] text-white border-[#4F46E5]"
                  : "bg-[#F7F8FD] text-[#64748B] border-[#CED6E0]"
              }`}
            >
              {t}
            </button>
          );
        })}
      </div>

      {/* Get Tickets Button: top 655px, same layout as movie details */}
      <button
        onClick={() => onGetTickets(selectedFormat, selectedTime)}
        className="absolute top-[655px] left-1/2 -translate-x-1/2 w-[345px] h-[37px] rounded-[5px] bg-[#4F46E5] text-[#FFFFFF] font-semibold text-[14px] flex items-center justify-center cursor-pointer font-inter hover:bg-[#4338ca] transition-colors"
      >
        Get Tickets
      </button>
    </div>
  );
}
