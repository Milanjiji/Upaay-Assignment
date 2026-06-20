"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

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

export default function SelectScheduleScreen({
  movie,
  theater,
  selectedDate,
  onBack,
  onCancel,
  onGetTickets,
}: SelectScheduleScreenProps) {
  const [slots, setSlots] = useState<ShowtimeSlot[]>([]);
  const [formats, setFormats] = useState<string[]>([]);
  const [times, setTimes] = useState<string[]>([]);
  const [selectedFormat, setSelectedFormat] = useState<string>("");
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [loading, setLoading] = useState(true);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";

  // Fetch showtime slots
  useEffect(() => {
    const fetchSlots = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${API_URL}/api/showtimes?movieId=${movie._id}&theaterId=${theater._id}&date=${selectedDate}`);
        if (res.ok) {
          const list: ShowtimeSlot[] = await res.json();
          setSlots(list);
          
          // Extract unique formats
          const uniqueFormats = Array.from(new Set(list.map((s) => s.format)));
          setFormats(uniqueFormats);
          
          if (uniqueFormats.length > 0) {
            setSelectedFormat(uniqueFormats[0]);
          }
        }
      } catch (err) {
        console.error("Failed to load showtime slots", err);
      } finally {
        setLoading(false);
      }
    };
    fetchSlots();
  }, [movie._id, theater._id, selectedDate, API_URL]);

  // Update times list when selectedFormat changes
  useEffect(() => {
    if (!selectedFormat) {
      setTimes([]);
      setSelectedTime("");
      return;
    }
    const filteredTimes = slots
      .filter((s) => s.format === selectedFormat)
      .map((s) => s.time);
      
    setTimes(filteredTimes);
    if (filteredTimes.length > 0) {
      setSelectedTime(filteredTimes[0]);
    } else {
      setSelectedTime("");
    }
  }, [selectedFormat, slots]);

  const handleSubmit = () => {
    // Find matching showtime ID
    const match = slots.find(
      (s) => s.format === selectedFormat && s.time === selectedTime
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

  // Find rate for selected format
  const activeSlot = slots.find((s) => s.format === selectedFormat);
  const priceDisplay = activeSlot ? `₹${activeSlot.price}` : theater.rateRange;

  return (
    <div className="relative w-full h-full flex flex-col bg-[#F7F8FD]">
      {/* Hero Banner Section: height 173px */}
      <div className="relative w-full h-[173px] shrink-0 bg-zinc-200">
        <img
          src={movie.posterUrl || "/assets/home/Hero Image.png"}
          alt={movie.title}
          className="absolute inset-0 w-full h-full object-cover"
        />
        {/* Title and metadata inside hero banner: top 98px */}
        <div className="absolute top-[98px] left-[26px] right-[26px] z-10 flex flex-col">
          <h1 className="text-[20px] font-bold text-white font-inter leading-tight truncate">
            {movie.title}
          </h1>
          
          {/* Metadata Row: Theater Name & Date */}
          <div className="flex items-center gap-[12px] mt-[6px] text-white font-normal font-inter text-[14px] leading-none opacity-90">
            <div className="flex items-center gap-[4px] truncate">
              <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor" className="shrink-0">
                <path d="M2 1a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1H2zm1 2h3v2H3V3zm0 4h3v2H3V7zm0 4h3v2H3v-2zm10 2H10v-2h3v2zm0-4H10V7h3v2zm0-4H10V3h3v2z"/>
              </svg>
              <span className="truncate">{theater.name}</span>
            </div>

            <div className="flex items-center gap-[4px] shrink-0">
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

      {loading ? (
        <div className="absolute top-[300px] left-0 right-0 text-center text-[12px] text-zinc-500 font-inter font-medium">
          Loading schedules...
        </div>
      ) : slots.length > 0 ? (
        <>
          {/* Format Row: top 267px, left/right margins 26px */}
          <div className="absolute top-[267px] left-[26px] right-[26px] flex items-center justify-between">
            <div className="flex items-center gap-[16px]">
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
              {priceDisplay}
            </span>
          </div>

          {/* Divider Bar: width 337px, top 311px */}
          <div className="absolute top-[311px] left-1/2 -translate-x-1/2 w-[337px] border-b border-[#CED6E0]" />

          {/* Screen 1 Title: top 331px, left 26px */}
          <h3 className="absolute top-[331px] left-[26px] text-[14px] font-semibold text-zinc-900 font-inter leading-none">
            Screen 1
          </h3>

          {/* Screen boxes (Times): top 360px, left/right margins 26px */}
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

          {/* Get Tickets Button: top 655px */}
          <button
            onClick={handleSubmit}
            className="absolute top-[655px] left-1/2 -translate-x-1/2 w-[345px] h-[37px] rounded-[5px] bg-[#4F46E5] text-[#FFFFFF] font-semibold text-[14px] flex items-center justify-center cursor-pointer font-inter hover:bg-[#4338ca] transition-colors"
          >
            Get Tickets
          </button>
        </>
      ) : (
        <div className="absolute top-[300px] left-[26px] right-[26px] text-center py-[20px]">
          <span className="text-[13px] text-zinc-500 font-inter font-medium">
            No showtimes scheduled for this date.
          </span>
        </div>
      )}
    </div>
  );
}
