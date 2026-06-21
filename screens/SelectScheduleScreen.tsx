"use client";

import { useEffect, useState, useMemo } from "react";
import Image from "next/image";
import useSWR from "swr";
import { fetcher } from "@/store/fetcher";

interface Movie {
  _id: string;
  title: string;
  genre: string;
  rating: number;
  posterUrl?: string;
}

interface Theater {
  _id: string;
  name: string;
  location: string;
  rateRange: string;
}

interface ShowtimeSlot {
  _id: string;
  movieId: string;
  theaterId: string;
  date: string;
  time: string;
  format: string;
  price: number;
  screenNumber: number;
}

interface SelectScheduleScreenProps {
  movie: Movie;
  theater: Theater;
  selectedDate: string;
  onBack: () => void;
  onCancel: () => void;
  onGetTickets: (selectedFormat: string, selectedTime: string, showtimeId: string) => void;
}

const EMPTY_ARRAY: ShowtimeSlot[] = [];

export default function SelectScheduleScreen({
  movie,
  theater,
  selectedDate,
  onBack,
  onCancel,
  onGetTickets,
}: SelectScheduleScreenProps) {
  const [formats, setFormats] = useState<string[]>([]);
  const [times, setTimes] = useState<string[]>([]);
  const [selectedFormat, setSelectedFormat] = useState<string>("");
  const [selectedTime, setSelectedTime] = useState<string>("");

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";

  // Fetch showtime slots using SWR
  const { data: rawSlots = EMPTY_ARRAY, isLoading: loading } = useSWR<ShowtimeSlot[]>(
    movie?._id && theater?._id ? `${API_URL}/api/showtimes?movieId=${movie._id}&theaterId=${theater._id}&date=${selectedDate}` : null,
    fetcher
  );

  // Map showtimes and mark past ones
  const slots = useMemo(() => {
    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const parseTimeToMinutes = (timeStr: string) => {
      const parts = timeStr.split(" ");
      if (parts.length !== 2) return 0;
      const [time, modifier] = parts;
      const timeParts = time.split(":");
      if (timeParts.length !== 2) return 0;
      let [hours, minutes] = timeParts.map(Number);
      if (hours === 12) hours = 0;
      if (modifier.toUpperCase() === "PM") hours += 12;
      return hours * 60 + minutes;
    };

    return rawSlots.map(slot => {
      const parsedStr = slot.date.includes("T") ? slot.date : `${slot.date}T00:00:00`;
      const slotDate = new Date(parsedStr);
      const sDate = new Date(slotDate.getFullYear(), slotDate.getMonth(), slotDate.getDate());

      let isPast = false;
      if (sDate.getTime() === today.getTime()) {
        const slotMinutes = parseTimeToMinutes(slot.time);
        isPast = slotMinutes <= currentMinutes;
      } else if (sDate < today) {
        isPast = true;
      }

      return { ...slot, isPast };
    });
  }, [rawSlots]);

  // Sync formats when slots change
  useEffect(() => {
    if (slots.length > 0) {
      const uniqueFormats = Array.from(new Set(slots.map((s) => s.format)));
      setFormats(uniqueFormats);
      if (!selectedFormat || !uniqueFormats.includes(selectedFormat)) {
        setSelectedFormat(uniqueFormats[0] || "");
      }
    } else {
      setFormats([]);
      setSelectedFormat("");
    }
  }, [slots]);

  // Update times list when selectedFormat changes
  useEffect(() => {
    if (!selectedFormat) {
      setTimes([]);
      setSelectedTime("");
      return;
    }
    const filteredSlots = slots.filter((s) => s.format === selectedFormat);
    const uniqueTimes = Array.from(new Set(filteredSlots.map((s) => s.time)));
      
    setTimes(uniqueTimes);
    
    // Auto-select the first non-past time if currently selected time is invalid or past
    const availableTimes = filteredSlots.filter(s => !s.isPast).map(s => s.time);
    
    setSelectedTime(prev => {
      if (prev && availableTimes.includes(prev)) {
        return prev;
      }
      return availableTimes.length > 0 ? availableTimes[0] : "";
    });
  }, [selectedFormat, slots]);

  const handleSubmit = () => {
    if (!selectedTime) {
      alert("Please select a valid showtime.");
      return;
    }
    // Find matching showtime ID
    const match = slots.find(
      (s) => s.format === selectedFormat && s.time === selectedTime && !s.isPast
    );
    if (match) {
      onGetTickets(selectedFormat, selectedTime, match._id);
    } else {
      alert("Selected showtime is not available.");
    }
  };

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

  // Find rate for selected format
  const activeSlot = slots.find((s) => s.format === selectedFormat);
  const priceDisplay = activeSlot ? `₹${activeSlot.price}` : theater.rateRange;

  return (
    <div className="relative w-full h-full flex flex-col bg-[#F7F8FD]">
      {/* Hero Banner Section: height 173px */}
      <div className="relative w-full h-43.25 shrink-0 bg-zinc-200">
        <img
          src={movie.posterUrl || "/assets/home/Hero Image.png"}
          alt={movie.title}
          className="absolute inset-0 w-full h-full object-cover"
        />
        {/* Dark overlay for text readability */}
        <div className="absolute inset-0 bg-[#151130B2] z-0" />
        
        {/* Title and metadata inside hero banner: top 98px */}
        <div className="absolute top-24.5 left-6.5 right-6.5 z-10 flex flex-col">
          <h1 className="text-[20px] font-bold text-white font-inter leading-tight truncate">
            {movie.title}
          </h1>
          
          {/* Metadata Row: Theater Name & Date */}
          <div className="flex items-center gap-3 mt-1.5 text-white font-normal font-inter text-[14px] leading-none opacity-90">
            <div className="flex items-center gap-1 truncate">
              <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor" className="shrink-0">
                <path d="M2 1a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1H2zm1 2h3v2H3V3zm0 4h3v2H3V7zm0 4h3v2H3v-2zm10 2H10v-2h3v2zm0-4H10V7h3v2zm0-4H10V3h3v2z"/>
              </svg>
              <span className="truncate">{theater.name}</span>
            </div>

            <div className="flex items-center gap-1 shrink-0">
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
        className="absolute left-6.5 top-7 z-20 cursor-pointer flex items-center gap-2 text-white font-semibold text-[14px] font-inter"
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
        className="absolute right-6.5 top-7 z-20 cursor-pointer text-white font-semibold text-[14px] font-inter"
      >
        Cancel
      </button>

      {/* Filling Progress Bar: top 191px, left/right margins: 26px, 40% filled */}
      <div className="absolute top-47.75 left-6.5 right-6.5 h-1.5 bg-[#E7E7E7] rounded-full overflow-hidden">
        <div className="h-full bg-[#4F46E5] w-[40%] rounded-full" />
      </div>

      {/* Choose Schedule Title: top 215px, left: 26px */}
      <h2 className="absolute top-53.75 left-6.5 text-[18px] font-bold text-zinc-900 font-inter leading-none">
        Choose Schedule
      </h2>

      {loading ? (
        <div className="absolute top-75 left-0 right-0 text-center text-[12px] text-zinc-500 font-inter font-medium">
          Loading schedules...
        </div>
      ) : slots.length > 0 ? (
        <>
          {/* Format Row: top 267px, left/right margins 26px */}
          <div className="absolute top-66.75 left-6.5 right-6.5 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="text-[14px] font-semibold text-zinc-900 font-inter">
                Format
              </span>

              {/* Format boxes */}
              <div className="flex gap-2">
                {formats.map((fmt) => {
                  const isSelected = selectedFormat === fmt;
                  return (
                    <button
                      key={fmt}
                      onClick={() => setSelectedFormat(fmt)}
                      className={`w-7 h-7 rounded-[5px] border flex items-center justify-center font-semibold text-[12px] font-inter cursor-pointer transition-all duration-150 ${
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
              {priceDisplay}
            </span>
          </div>

          {/* Divider Bar: width 337px, top 311px */}
          <div className="absolute top-77.75 left-1/2 -translate-x-1/2 w-84.25 border-b border-[#CED6E0]" />

          {/* Screen 1 Title: top 331px, left 26px */}
          <h3 className="absolute top-82.75 left-6.5 text-[14px] font-semibold text-zinc-900 font-inter leading-none">
            Screen 1
          </h3>

          {/* Screen boxes (Times): top 360px, left/right margins 26px */}
          <div className="absolute top-90 left-6.5 right-6.5 grid grid-cols-3 gap-3 w-fit">
            {times.map((t) => {
              const slotMatch = slots.find(s => s.format === selectedFormat && s.time === t);
              const isPast = slotMatch ? slotMatch.isPast : false;
              const isSelected = selectedTime === t;
              return (
                <button
                  key={t}
                  disabled={isPast}
                  onClick={() => setSelectedTime(t)}
                  className={`px-2.5 h-8 w-full rounded-[5px] border flex items-center justify-center font-semibold text-[12px] font-inter transition-all duration-150 ${
                    isPast
                      ? "bg-[#E2E8F0] text-[#94A3B8] border-[#E2E8F0] cursor-not-allowed"
                      : isSelected
                        ? "bg-[#4F46E5] text-white border-[#4F46E5] cursor-pointer"
                        : "bg-[#F7F8FD] text-[#64748B] border-[#CED6E0] cursor-pointer"
                  }`}
                >
                  {t}
                </button>
              );
            })}
          </div>

          {/* Get Tickets Button: top 655px */}
          <button
            disabled={!selectedTime}
            onClick={handleSubmit}
            className={`absolute top-163.75 left-1/2 -translate-x-1/2 w-86.25 h-9.25 rounded-[5px] font-semibold text-[14px] flex items-center justify-center font-inter transition-colors ${
              !selectedTime ? "bg-[#94A3B8] text-white cursor-not-allowed" : "bg-[#4F46E5] text-[#FFFFFF] cursor-pointer hover:bg-[#4338ca]"
            }`}
          >
            Get Tickets
          </button>
        </>
      ) : (
        <div className="absolute top-75 left-6.5 right-6.5 text-center py-5">
          <span className="text-[13px] text-zinc-500 font-inter font-medium">
            No showtimes scheduled for this date.
          </span>
        </div>
      )}
    </div>
  );
}
