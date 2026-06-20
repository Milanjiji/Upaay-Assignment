"use client";

import { useState } from "react";
import { useDispatch } from "react-redux";
import { resetNavigation } from "@/store/slices/navigationSlice";
import { resetBooking } from "@/store/slices/bookingSlice";
import useSWR from "swr";
import { fetcher } from "@/store/fetcher";

interface Ticket {
  _id: string;
  movieId: { title: string; genre: string; posterUrl: string };
  theaterId: { name: string; location: string };
  showtimeId: { date: string; time: string; format: string };
  seats: string[];
  totalPrice: number;
  transactionDate: string;
}

export default function TicketsScreen() {
  const dispatch = useDispatch();

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";

  // Fetch tickets from backend using SWR
  const { data: tickets = [], isLoading: loading } = useSWR<Ticket[]>(
    `${API_URL}/api/bookings/user`,
    fetcher
  );

  const handleBookNow = () => {
    dispatch(resetBooking());
    dispatch(resetNavigation());
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

  return (
    <div className="relative w-full h-full flex flex-col bg-[#F7F8FD]">
      {/* Title Header: top 28px */}
      <div className="absolute top-[28px] left-[26px] right-[26px] h-[30px] flex items-center justify-between">
        <h1 className="text-[20px] font-bold text-zinc-900 font-inter">My Tickets</h1>
      </div>

      {/* Tickets List / Empty State: top 78px, bottom 89px */}
      <div className="absolute top-[78px] left-[26px] right-[26px] bottom-[89px] overflow-y-auto scrollbar-none flex flex-col gap-[16px] pb-[16px]">
        {loading ? (
          <div className="flex-1 w-full h-full flex items-center justify-center text-[12px] text-zinc-500 font-inter font-medium py-[40px]">
            Loading tickets...
          </div>
        ) : tickets.length > 0 ? (
          tickets.map((ticket) => (
            <div
              key={ticket._id}
              className="w-full bg-white rounded-[12px] border border-zinc-150 shadow-[0_4px_12px_rgba(0,0,0,0.02)] overflow-hidden flex flex-col shrink-0"
            >
              {/* Card Header (Movie Title & Format) */}
              <div className="p-[14px] bg-[#4F46E5]/5 border-b border-zinc-100 flex items-center justify-between">
                <span className="text-[14px] font-bold text-zinc-950 font-inter truncate pr-[8px]">
                  {ticket.movieId?.title || "Movie Ticket"}
                </span>
                <span className="bg-[#4F46E5] text-white text-[10px] font-bold font-inter px-[6px] py-[2px] rounded">
                  {ticket.showtimeId?.format || "2D"}
                </span>
              </div>

              {/* Card Details */}
              <div className="p-[14px] flex flex-col gap-[10px]">
                {/* Theater Name */}
                <div className="flex items-center gap-[6px] text-zinc-600 text-[12px] font-inter">
                  <img
                    src="/assets/Vector-3.svg"
                    alt="Theater"
                    className="w-[11px] h-[10px] shrink-0 opacity-70"
                  />
                  <span className="truncate">{ticket.theaterId?.name || "Theater location"}</span>
                </div>

                {/* Date & Time */}
                <div className="flex items-center justify-between text-zinc-500 text-[12px] font-inter">
                  <div className="flex items-center gap-[6px]">
                    <img
                      src="/assets/formkit_date.svg"
                      alt="Date"
                      className="w-[11px] h-[11px] shrink-0 opacity-70"
                    />
                    <span>{formatSelectedDate(ticket.showtimeId?.date)}</span>
                  </div>
                  <span>{ticket.showtimeId?.time}</span>
                </div>

                {/* Seats list */}
                <div className="flex items-center justify-between mt-[4px]">
                  <div className="flex flex-col gap-[4px]">
                    <span className="text-[10px] font-semibold text-zinc-400 font-inter uppercase tracking-wider">
                      Seats
                    </span>
                    <div className="flex flex-wrap gap-[4px]">
                      {ticket.seats.map((seat) => (
                        <span
                          key={seat}
                          className="bg-zinc-100 text-zinc-700 font-bold text-[10px] font-inter rounded px-[5px] py-[2px]"
                        >
                          {seat.replace("-", "")}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Total Paid */}
                  <div className="flex flex-col items-end gap-[2px]">
                    <span className="text-[10px] font-semibold text-zinc-400 font-inter uppercase tracking-wider">
                      Paid
                    </span>
                    <span className="text-[14px] font-bold text-zinc-950 font-inter">
                      ₹{ticket.totalPrice}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center flex-1 py-[60px] text-center">
            {/* Cute Ticket Outline */}
            <div className="w-[100px] h-[100px] bg-zinc-100 rounded-full flex items-center justify-center mb-[20px]">
              <svg
                className="w-[48px] h-[48px] text-zinc-400"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M16.5 6v.75m0 3v.75m0 3v.75m0 3V18m-9-12h12c1.38 0 2.5 1.12 2.5 2.5v7.5c0 1.38-1.12 2.5-2.5 2.5h-12A2.5 2.5 0 0 1 2.5 16V8.5C2.5 7.12 3.62 6 5 6z"
                />
              </svg>
            </div>
            
            <h2 className="text-[16px] font-bold text-zinc-800 font-inter mb-[6px]">
              No Tickets Booked Yet
            </h2>
            <p className="text-[13px] font-normal text-zinc-500 font-inter max-w-[200px] mb-[24px] leading-relaxed">
              Once you book a movie, your tickets will show up here.
            </p>

            <button
              onClick={handleBookNow}
              className="px-[24px] py-[10px] bg-[#4F46E5] text-white text-[13px] font-bold rounded-[8px] hover:bg-[#4338ca] transition-all cursor-pointer shadow-sm shadow-[#4F46E5]/20 font-inter"
            >
              Explore Movies
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
