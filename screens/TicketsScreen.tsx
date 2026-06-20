"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useDispatch } from "react-redux";
import { resetNavigation } from "@/store/slices/navigationSlice";
import { resetBooking } from "@/store/slices/bookingSlice";

interface Ticket {
  movieTitle: string;
  theaterName: string;
  formattedDate: string;
  time: string;
  format: string;
  seats: string[];
  price: number;
  transactionDate: string;
}

export default function TicketsScreen() {
  const dispatch = useDispatch();
  const [tickets, setTickets] = useState<Ticket[]>([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("booked_tickets");
      if (stored) {
        setTickets(JSON.parse(stored));
      }
    } catch (e) {
      console.error("Error reading tickets", e);
    }
  }, []);

  const handleBookNow = () => {
    dispatch(resetBooking());
    dispatch(resetNavigation());
  };

  return (
    <div className="relative w-full h-full flex flex-col bg-[#F7F8FD]">
      {/* Title Header: top 28px */}
      <div className="absolute top-[28px] left-[26px] right-[26px] h-[30px] flex items-center justify-between">
        <h1 className="text-[20px] font-bold text-zinc-900 font-inter">My Tickets</h1>
      </div>

      {/* Tickets List / Empty State: top 78px, bottom 89px */}
      <div className="absolute top-[78px] left-[26px] right-[26px] bottom-[89px] overflow-y-auto scrollbar-none flex flex-col gap-[16px] pb-[16px]">
        {tickets.length > 0 ? (
          tickets.map((ticket, idx) => (
            <div
              key={idx}
              className="w-full bg-white rounded-[12px] border border-zinc-150 shadow-[0_4px_12px_rgba(0,0,0,0.02)] overflow-hidden flex flex-col shrink-0"
            >
              {/* Card Header (Movie Title & Format) */}
              <div className="p-[14px] bg-[#4F46E5]/5 border-b border-zinc-100 flex items-center justify-between">
                <span className="text-[14px] font-bold text-zinc-950 font-inter truncate pr-[8px]">
                  {ticket.movieTitle}
                </span>
                <span className="bg-[#4F46E5] text-white text-[10px] font-bold font-inter px-[6px] py-[2px] rounded">
                  {ticket.format}
                </span>
              </div>

              {/* Card Details */}
              <div className="p-[14px] flex flex-col gap-[10px]">
                {/* Theater Name */}
                <div className="flex items-center gap-[6px] text-zinc-600 text-[12px] font-inter">
                  <Image
                    src="/assets/Vector-3.svg"
                    alt="Theater"
                    width={11}
                    height={10}
                    className="shrink-0 opacity-70"
                  />
                  <span className="truncate">{ticket.theaterName}</span>
                </div>

                {/* Date & Time */}
                <div className="flex items-center justify-between text-zinc-500 text-[12px] font-inter">
                  <div className="flex items-center gap-[6px]">
                    <Image
                      src="/assets/formkit_date.svg"
                      alt="Date"
                      width={11}
                      height={11}
                      className="shrink-0 opacity-70"
                    />
                    <span>{ticket.formattedDate}</span>
                  </div>
                  <span>{ticket.time}</span>
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
                      ₹{ticket.price}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center flex-1 py-[60px] text-center">
            {/* Cute Ticket Outline/Placeholder */}
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
