"use client";

import { useState } from "react";
import { useDispatch } from "react-redux";
import { resetNavigation } from "@/store/slices/navigationSlice";
import { resetBooking } from "@/store/slices/bookingSlice";
import useSWR, { mutate as globalMutate } from "swr";
import { fetcher } from "@/store/fetcher";
import Image from "next/image";

interface Ticket {
  _id: string;
  movieId: { title: string; genre: string; posterUrl: string; formats: string[]; rating: number; pgRating: string };
  theaterId: { name: string; location: string };
  showtimeId: { _id: string; date: string; time: string; format: string };
  seats: string[];
  totalPrice: number;
  transactionDate: string;
  createdAt: string;
}

export default function TicketsScreen() {
  const dispatch = useDispatch();
  const [activeTab, setActiveTab] = useState<"my_bookings" | "past_bookings">("my_bookings");

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";

  // Fetch tickets from backend using SWR
  const { data: tickets = [], isLoading: loading, mutate } = useSWR<Ticket[]>(
    `${API_URL}/api/bookings/user`,
    fetcher
  );

  const handleBack = () => {
    dispatch(resetBooking());
    dispatch(resetNavigation());
  };

  const handleBookNow = () => {
    dispatch(resetBooking());
    dispatch(resetNavigation());
  };

  const handleCancel = async (bookingId: string) => {
    if (!confirm("Are you sure you want to cancel this booking and free the seats?")) return;
    try {
      const cookies = document.cookie.split(";");
      const tokenCookie = cookies.find(c => c.trim().startsWith("token="));
      const tokenVal = tokenCookie ? tokenCookie.split("=")[1] : "";
      if (!tokenVal) {
        alert("Session expired. Please log in again.");
        return;
      }

      const res = await fetch(`${API_URL}/api/bookings/${bookingId}`, {
        method: "DELETE",
        headers: { "x-user-id": tokenVal }
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to cancel booking");
      }

      // Invalidate the specific showtime's seat layout cache immediately
      const cancelledTicket = tickets.find(t => t._id === bookingId);
      if (cancelledTicket?.showtimeId?._id) {
        await globalMutate(`${API_URL}/api/showtimes/${cancelledTicket.showtimeId._id}`);
      }

      alert("Booking cancelled. Seats have been freed.");
      mutate(); // Reload SWR cache
    } catch (e: any) {
      alert(`Cancel Error: ${e.message}`);
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

  // Format transaction date to match layout: "10/9/2023 10:45 AM"
  const formatTransactionDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      const day = date.getDate();
      const month = date.getMonth() + 1;
      const year = date.getFullYear();
      let hours = date.getHours();
      const minutes = date.getMinutes();
      const ampm = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12;
      hours = hours ? hours : 12;
      const minutesStr = minutes < 10 ? '0' + minutes : minutes;
      return `${month}/${day}/${year} ${hours}:${minutesStr} ${ampm}`;
    } catch (e) {
      return dateStr;
    }
  };

  const getShowtimeDateTime = (dateStr: string, timeStr: string) => {
    try {
      const [datePart] = dateStr.split("T");
      const [time, modifier] = timeStr.split(" ");
      let [hoursStr, minutesStr] = time.split(":");
      let hours = parseInt(hoursStr, 10);
      const minutes = parseInt(minutesStr, 10);
      
      if (modifier === "PM" && hours < 12) {
        hours += 12;
      }
      if (modifier === "AM" && hours === 12) {
        hours = 0;
      }
      
      const [year, month, day] = datePart.split("-").map(num => parseInt(num, 10));
      return new Date(year, month - 1, day, hours, minutes);
    } catch (e) {
      return new Date(dateStr);
    }
  };

  const now = new Date();
  const myBookings = tickets.filter(t => {
    if (!t.showtimeId) return false;
    return getShowtimeDateTime(t.showtimeId.date, t.showtimeId.time) >= now;
  });
  const pastBookings = tickets.filter(t => {
    if (!t.showtimeId) return true;
    return getShowtimeDateTime(t.showtimeId.date, t.showtimeId.time) < now;
  });
  const activeTickets = activeTab === "my_bookings" ? myBookings : pastBookings;

  return (
    <div className="relative w-full h-full flex flex-col bg-[#F7F8FD]">
      {/* Back button: top 28px, left 26px */}
      <button
        onClick={handleBack}
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

      {/* Tabs Container: top 78px, left/right margins: 26px, height: 20px */}
      <div className="absolute top-19.5 left-6.5 right-6.5 h-5 flex items-center gap-6">
        <button
          onClick={() => setActiveTab("my_bookings")}
          className={`h-full flex items-center justify-center cursor-pointer transition-all duration-150 border-b-2 pb-0.5 ${
            activeTab === "my_bookings"
              ? "text-[#4F46E5] border-[#4F46E5]"
              : "text-[#64748B] border-transparent"
          } text-[12px] font-bold font-inter`}
        >
          My Bookings
        </button>
        
        <button
          onClick={() => setActiveTab("past_bookings")}
          className={`h-full flex items-center justify-center cursor-pointer transition-all duration-150 border-b-2 pb-0.5 ${
            activeTab === "past_bookings"
              ? "text-[#4F46E5] border-[#4F46E5]"
              : "text-[#64748B] border-transparent"
          } text-[12px] font-bold font-inter`}
        >
          Past Bookings
        </button>
      </div>

      {/* Tickets List Container: top 120px, bottom 89px */}
      <div className="absolute top-30 left-6.5 right-6.5 bottom-22.25 overflow-y-auto scrollbar-none flex flex-col gap-5 pb-5 items-center">
        {loading ? (
          <div className="w-full flex-1 flex flex-col items-center justify-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-[#4F46E5] mb-3" />
            <span className="text-[13px] font-medium text-[#64748B] font-inter">Loading tickets...</span>
          </div>
        ) : activeTickets.length > 0 ? (
          activeTickets.map((ticket) => (
            <div
              key={ticket._id}
              className="w-80.5 bg-white rounded-[5px] border border-[#D9D9D9] overflow-hidden flex flex-col shrink-0"
            >
              {/* Movie Banner Banner: width 322px, height 169px */}
              <div className="relative w-full h-42.25 shrink-0 bg-zinc-200">
                <img
                  src={ticket.movieId?.posterUrl || "/assets/home/Hero Image.png"}
                  alt={ticket.movieId?.title || "Movie Banner"}
                  className="absolute inset-0 w-full h-full object-cover"
                />
              </div>

              {/* Details Box inside card */}
              <div className="p-4 flex flex-col w-full">
                {/* Movie Title: font Inter 700 Bold 16px */}
                <h3 className="text-[16px] font-bold text-[#121212] font-inter leading-none">
                  {ticket.movieId?.title || "Movie Ticket"}
                </h3>

                {/* Theater & Screen & Format: (approx 20px gap) */}
                <div className="flex justify-between items-center mt-5 text-[14px] font-medium text-[#121212] font-inter leading-none">
                  <span className="truncate pr-2">{ticket.theaterId?.name}</span>
                  <span className="shrink-0">Screen 1 - {ticket.showtimeId?.format}</span>
                </div>

                {/* Date & Time Row: (approx 14px gap) */}
                <div className="flex justify-between items-center mt-3.5 text-[14px] font-medium text-[#64748B] font-inter leading-none">
                  <span>{formatSelectedDate(ticket.showtimeId?.date)}</span>
                  <span>{ticket.showtimeId?.time}</span>
                </div>

                {/* Seats & Amount Paid Row: (approx 24px gap) */}
                <div className="flex justify-between items-start mt-6">
                  {/* Seats Badges */}
                  <div className="flex flex-col gap-1.5">
                    <span className="text-[14px] font-medium text-[#64748B] font-inter leading-none">
                      Seats:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {ticket.seats.map((seat) => (
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
                      ₹{ticket.totalPrice}
                    </span>
                  </div>
                </div>

                {/* Transaction Info and QR Code Row: (approx 28px gap, no dotted line) */}
                <div className="flex justify-between items-end mt-7">
                  {/* Cancel Button and Transaction Date */}
                  <div className="flex flex-col gap-3 text-[12px] text-[#64748B] font-inter leading-tight items-start">
                    {activeTab === "my_bookings" && (
                      <button
                        onClick={() => handleCancel(ticket._id)}
                        className="bg-[#F7F8FD] border border-[#CED6E0] rounded-[5px] px-2.5 py-2 text-[#ED183E] font-semibold text-[12px] font-inter cursor-pointer transition-colors hover:bg-red-50"
                      >
                        Cancel Booking
                      </button>
                    )}
                    <div className="flex flex-col gap-1">
                      <span>Transaction Date:</span>
                      <span className="font-medium">
                        {formatTransactionDate(ticket.transactionDate || ticket.createdAt)}
                      </span>
                    </div>
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
          ))
        ) : (
          <div className="flex flex-col items-center justify-center flex-1 py-15 text-center w-80.5">
            {/* Cute Ticket Outline */}
            <div className="w-25 h-25 bg-zinc-100 rounded-full flex items-center justify-center mb-5">
              <svg
                className="w-12 h-12 text-zinc-400"
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
            
            <h2 className="text-[16px] font-bold text-zinc-800 font-inter mb-1.5">
              {activeTab === "my_bookings" ? "No Upcoming Bookings" : "No Past Bookings"}
            </h2>
            <p className="text-[13px] font-normal text-zinc-500 font-inter max-w-50 mb-6 leading-relaxed">
              {activeTab === "my_bookings" 
                ? "Once you book a movie, your upcoming tickets will show up here." 
                : "You don't have any past theater bookings yet."}
            </p>

            <button
              onClick={handleBookNow}
              className="px-6 py-2.5 bg-[#4F46E5] text-white text-[13px] font-bold rounded-lg hover:bg-[#4338ca] transition-all cursor-pointer shadow-sm shadow-[#4F46E5]/20 font-inter"
            >
              Explore Movies
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
