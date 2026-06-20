"use client";

import { useState } from "react";
import Image from "next/image";

// Mock Theater Data (same as HomeScreen)
const theaters = [
  {
    id: 1,
    name: "The Grandview",
    location: "Camp Aguinaldo, Quezon City",
    rate: "₹320 - ₹450",
  },
  {
    id: 2,
    name: "Play Loft",
    location: "Aurora Boulevard, Santa Mesa",
    rate: "₹300 - ₹430",
  },
  {
    id: 3,
    name: "CinemaOne",
    location: "A. Cruz, Pasay City",
    rate: "₹320",
  },
  {
    id: 4,
    name: "Cinemount",
    location: "Baclaran, Paranaque City",
    rate: "₹350",
  },
];

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

interface SelectTheatreScreenProps {
  movie: Movie;
  onBack: () => void;
  onCancel: () => void;
  onSelectTheatre: (theater: Theater, dateString: string) => void;
}

export default function SelectTheatreScreen({ movie, onBack, onCancel, onSelectTheatre }: SelectTheatreScreenProps) {
  // Generate next 7 days starting from today
  const getDays = () => {
    const days = [];
    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const today = new Date();
    
    for (let i = 0; i < 7; i++) {
      const nextDay = new Date(today);
      nextDay.setDate(today.getDate() + i);
      days.push({
        name: dayNames[nextDay.getDay()],
        number: nextDay.getDate(),
        dateString: nextDay.toISOString().split("T")[0],
      });
    }
    return days;
  };

  const daysList = getDays();
  const [selectedDate, setSelectedDate] = useState<string>(daysList[0].dateString);

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
        {/* Title inside hero banner: top 98px */}
        <div className="absolute top-[98px] left-[26px] right-[26px] z-10 flex flex-col">
          <h1 className="text-[20px] font-bold text-white font-inter leading-tight">
            {movie.title}
          </h1>
          <p className="text-[14px] font-normal text-white font-inter mt-[4px] leading-tight opacity-90">
            {movie.genre}
          </p>
        </div>
      </div>

      {/* Back button: top 44px, left 26px */}
      <button
        onClick={onBack}
        className="absolute left-[26px] top-[44px] z-20 cursor-pointer flex items-center gap-[8px] text-white font-semibold text-[14px] font-inter"
      >
        <Image
          src="/assets/ep_back.svg"
          alt="Back"
          width={21}
          height={21}
        />
        Back
      </button>

      {/* Cancel button: top 46px, right 26px */}
      <button
        onClick={onCancel}
        className="absolute right-[26px] top-[46px] z-20 cursor-pointer text-white font-semibold text-[14px] font-inter"
      >
        Cancel
      </button>

      {/* Filling Progress Bar: top 191px, left/right margins: 26px */}
      <div className="absolute top-[191px] left-[26px] right-[26px] h-[6px] bg-[#E7E7E7] rounded-full overflow-hidden">
        <div className="h-full bg-[#4F46E5] w-[20%] rounded-full" />
      </div>

      {/* Select Movie Theatre Title: top 216px, left: 26px */}
      <h2 className="absolute top-[216px] left-[26px] text-[18px] font-bold text-zinc-900 font-inter leading-none">
        Select Movie Theatre
      </h2>

      {/* Dates Row: top 250px, left/right margins: 46px */}
      <div className="absolute top-[250px] left-[46px] right-[46px] flex justify-between">
        {daysList.map((day) => {
          const isSelected = selectedDate === day.dateString;
          return (
            <div key={day.dateString} className="flex flex-col items-center">
              {/* Day Name text: Inter 600 SemiBold 12px */}
              <span
                className={`text-[12px] font-semibold font-inter leading-none ${
                  isSelected ? "text-[#4F46E5]" : "text-[#64748B]"
                }`}
              >
                {day.name}
              </span>
              
              {/* Day Number Box: width: 28px, height: 28px, top: 10px gap to day text, border-radius: 5px */}
              <button
                onClick={() => setSelectedDate(day.dateString)}
                className={`w-[28px] h-[28px] mt-[10px] rounded-[5px] border flex items-center justify-center font-semibold text-[14px] font-inter cursor-pointer transition-all duration-150 ${
                  isSelected
                    ? "bg-[#4F46E5] text-white border-[#4F46E5]"
                    : "bg-[#F7F8FD] text-[#64748B] border-[#CED6E0]"
                }`}
              >
                {day.number}
              </button>
            </div>
          );
        })}
      </div>

      {/* Divider Bar: width 337px, top 331px */}
      <div className="absolute top-[331px] left-1/2 -translate-x-1/2 w-[337px] border-b border-[#CED6E0]" />

      {/* Theaters List Container: top 360px, left/right margins: 26px, bottom: 16px, scrollable */}
      <div className="absolute top-[360px] left-[26px] right-[26px] bottom-[16px] flex flex-col gap-[8px] overflow-y-auto scrollbar-none">
        {theaters.map((theater) => (
          <button
            key={theater.id}
            onClick={() => onSelectTheatre(theater, selectedDate)}
            className="w-full h-[73px] flex items-center shrink-0 cursor-pointer text-left focus:outline-none"
          >
            {/* Theater Logo: Square of 73px, border radius: 5px */}
            <div className="w-[73px] h-[73px] rounded-[5px] overflow-hidden shrink-0 relative bg-white border border-zinc-100 flex items-center justify-center">
              <Image
                src="/assets/home/Hero Image.png"
                alt={theater.name}
                fill
                className="object-cover opacity-80"
              />
            </div>

            {/* Theater Details: gap of 20px from logo */}
            <div className="ml-[20px] flex-1 flex flex-col justify-between h-full py-[1px]">
              <div className="flex flex-col gap-[4px]">
                {/* Theater Name: Inter 600 SemiBold 14px */}
                <h3 className="text-[14px] font-semibold text-zinc-900 font-inter leading-[18px] truncate">
                  {theater.name}
                </h3>

                {/* Theater Location: Inter 400 Regular 12px, color: #64748B */}
                <div className="flex items-center gap-[4px]">
                  <svg
                    className="w-[12px] h-[12px] text-[#64748B] shrink-0"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span className="text-[12px] font-normal text-[#64748B] font-inter truncate leading-[15px]">
                    {theater.location}
                  </span>
                </div>
              </div>

              {/* Rate Range: Inter 600 SemiBold 14px, color: #64748B */}
              <p className="text-[14px] font-semibold text-[#64748B] font-inter leading-none pb-[10px]">
                {theater.rate}
              </p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
