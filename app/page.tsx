"use client";

import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/store";
import {
  navigateTo,
  goBack,
  resetNavigation,
} from "@/store/slices/navigationSlice";
import {
  setSelectedMovie,
  setSelectedTheatreAndDate,
  setSelectedSchedule,
  setBookedSeatsAndPrice,
  resetBooking,
} from "@/store/slices/bookingSlice";
import { loginSuccess } from "@/store/slices/authSlice";

import HomeScreen from "@/screens/HomeScreen";
import MovieDetailsScreen from "@/screens/MovieDetailsScreen";
import SelectTheatreScreen from "@/screens/SelectTheatreScreen";
import SelectScheduleScreen from "@/screens/SelectScheduleScreen";
import SelectSeatsScreen from "@/screens/SelectSeatsScreen";
import BookingSummaryScreen from "@/screens/BookingSummaryScreen";
import CheckoutScreen from "@/screens/CheckoutScreen";
import PaymentSuccessScreen from "@/screens/PaymentSuccessScreen";
import TicketsScreen from "@/screens/TicketsScreen";
import FavoritesScreen from "@/screens/FavoritesScreen";
import ProfileScreen from "@/screens/ProfileScreen";
import Footer from "@/components/Footer";

export default function Home() {
  const dispatch = useDispatch();
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";

  useEffect(() => {
    const rehydrateAuth = async () => {
      try {
        const cookies = document.cookie.split(";");
        const tokenCookie = cookies.find(c => c.trim().startsWith("token="));
        const tokenVal = tokenCookie ? tokenCookie.split("=")[1] : "";
        if (!tokenVal) return;

        const res = await fetch(`${API_URL}/api/auth/me`, {
          headers: { "x-user-id": tokenVal }
        });
        if (res.ok) {
          const data = await res.json();
          dispatch(loginSuccess({ user: data.user, token: tokenVal }));
        }
      } catch (e) {
        console.error("Auth rehydration failed", e);
      }
    };
    rehydrateAuth();
  }, [dispatch, API_URL]);

  const activeView = useSelector((state: RootState) => state.navigation.activeView);
  const selectedMovie = useSelector((state: RootState) => state.booking.selectedMovie);
  const selectedTheatre = useSelector((state: RootState) => state.booking.selectedTheatre);
  const selectedDate = useSelector((state: RootState) => state.booking.selectedDate);
  const selectedTime = useSelector((state: RootState) => state.booking.selectedTime);
  const selectedFormat = useSelector((state: RootState) => state.booking.selectedFormat);
  const bookedSeats = useSelector((state: RootState) => state.booking.bookedSeats);
  const bookedTotalPrice = useSelector((state: RootState) => state.booking.bookedTotalPrice);
  const selectedShowtimeId = useSelector((state: RootState) => state.booking.selectedShowtimeId);

  const handleSelectMovie = (movie: any) => {
    dispatch(setSelectedMovie(movie));
    dispatch(navigateTo("details"));
  };

  const handleCloseDetails = () => {
    dispatch(setSelectedMovie(null));
    dispatch(navigateTo("home"));
  };

  const handleBookTickets = () => {
    dispatch(navigateTo("select_theatre"));
  };

  const handleBackFromTheatre = () => {
    dispatch(navigateTo("details"));
  };

  const handleCancelFromTheatre = () => {
    resetBookingFlow();
  };

  const handleSelectTheatre = (theater: any, dateString: string) => {
    dispatch(setSelectedTheatreAndDate({ theater, dateString }));
    dispatch(navigateTo("select_schedule"));
  };

  const handleBackFromSchedule = () => {
    dispatch(navigateTo("select_theatre"));
  };

  const handleCancelFromSchedule = () => {
    resetBookingFlow();
  };

  const handleGetTickets = (format: string, time: string, showtimeId: string) => {
    dispatch(setSelectedSchedule({ format, time, showtimeId }));
    dispatch(navigateTo("select_seats"));
  };

  const handleBackFromSeats = () => {
    dispatch(navigateTo("select_schedule"));
  };

  const handleCancelFromSeats = () => {
    resetBookingFlow();
  };

  const handleConfirmBooking = (seats: string[], totalPrice: number) => {
    dispatch(setBookedSeatsAndPrice({ seats, totalPrice }));
    dispatch(navigateTo("booking_summary"));
  };

  const handleBackFromSummary = () => {
    dispatch(navigateTo("select_seats"));
  };

  const handleCancelFromSummary = () => {
    resetBookingFlow();
  };

  const handleProceedToPayment = () => {
    dispatch(navigateTo("checkout"));
  };

  const handleBackFromCheckout = () => {
    dispatch(navigateTo("booking_summary"));
  };

  const handleCancelFromCheckout = () => {
    resetBookingFlow();
  };

  const handleCompletePayment = async (cardDetails?: any) => {
    try {
      const cookies = document.cookie.split(";");
      const tokenCookie = cookies.find(c => c.trim().startsWith("token="));
      const tokenVal = tokenCookie ? tokenCookie.split("=")[1] : "";

      if (!tokenVal) {
        alert("Session expired. Please log in again.");
        return;
      }

      const payload = {
        movieId: selectedMovie?._id,
        theaterId: selectedTheatre?._id,
        showtimeId: selectedShowtimeId,
        seats: bookedSeats,
        totalPrice: bookedTotalPrice + 20,
        paymentMethod: "card",
        cardDetails: {
          nameOnCard: cardDetails?.nameOnCard || "Milan Jiji",
          cardNumber: cardDetails?.cardNumber ? `**** **** **** ${cardDetails.cardNumber.slice(-4)}` : "**** **** **** 1234"
        }
      };

      const res = await fetch(`${API_URL}/api/bookings`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": tokenVal
        },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to finalize booking");
      }

      dispatch(navigateTo("payment_success"));
    } catch (e: any) {
      alert(`Booking Error: ${e.message}`);
    }
  };

  const handleCloseSuccess = () => {
    resetBookingFlow();
  };

  const handleProceedToFinal = () => {
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
    const summary = `🎉 Ticket Booked Successfully! 🎉\n\n` +
      `🎬 Movie: ${selectedMovie?.title || ""}\n` +
      `🏛️ Theater: ${selectedTheatre?.name || ""}\n` +
      `📅 Date: ${formattedDate}\n` +
      `⏰ Time: ${selectedTime} (${selectedFormat})\n` +
      `💺 Seats: ${bookedSeats.join(", ")}\n` +
      `💰 Total Paid: ₹${bookedTotalPrice + 20}`;

    alert(summary);
    resetBookingFlow();
  };

  const resetBookingFlow = () => {
    dispatch(resetBooking());
    dispatch(resetNavigation());
  };

  let screenContent;

  if (activeView === "details" && selectedMovie) {
    screenContent = (
      <MovieDetailsScreen
        movie={selectedMovie}
        onClose={handleCloseDetails}
        onBookTickets={handleBookTickets}
      />
    );
  } else if (activeView === "select_theatre" && selectedMovie) {
    screenContent = (
      <SelectTheatreScreen
        movie={selectedMovie}
        onBack={handleBackFromTheatre}
        onCancel={handleCancelFromTheatre}
        onSelectTheatre={handleSelectTheatre}
      />
    );
  } else if (activeView === "select_schedule" && selectedMovie && selectedTheatre) {
    screenContent = (
      <SelectScheduleScreen
        movie={selectedMovie}
        theater={selectedTheatre}
        selectedDate={selectedDate}
        onBack={handleBackFromSchedule}
        onCancel={handleCancelFromSchedule}
        onGetTickets={handleGetTickets}
      />
    );
  } else if (activeView === "select_seats" && selectedMovie && selectedTheatre) {
    screenContent = (
      <SelectSeatsScreen
        movie={selectedMovie}
        theater={selectedTheatre}
        selectedDate={selectedDate}
        selectedTime={selectedTime}
        selectedFormat={selectedFormat}
        onBack={handleBackFromSeats}
        onCancel={handleCancelFromSeats}
        onConfirmBooking={handleConfirmBooking}
      />
    );
  } else if (activeView === "booking_summary" && selectedMovie && selectedTheatre) {
    screenContent = (
      <BookingSummaryScreen
        movie={selectedMovie}
        theater={selectedTheatre}
        selectedDate={selectedDate}
        selectedTime={selectedTime}
        selectedFormat={selectedFormat}
        seats={bookedSeats}
        totalPrice={bookedTotalPrice}
        onBack={handleBackFromSummary}
        onCancel={handleCancelFromSummary}
        onProceedToPayment={handleProceedToPayment}
      />
    );
  } else if (activeView === "checkout" && selectedMovie && selectedTheatre) {
    screenContent = (
      <CheckoutScreen
        movie={selectedMovie}
        theater={selectedTheatre}
        selectedDate={selectedDate}
        selectedTime={selectedTime}
        selectedFormat={selectedFormat}
        seats={bookedSeats}
        totalPrice={bookedTotalPrice}
        onBack={handleBackFromCheckout}
        onCancel={handleCancelFromCheckout}
        onCompletePayment={handleCompletePayment}
      />
    );
  } else if (activeView === "payment_success" && selectedMovie && selectedTheatre) {
    screenContent = (
      <PaymentSuccessScreen
        movie={selectedMovie}
        theater={selectedTheatre}
        selectedDate={selectedDate}
        selectedTime={selectedTime}
        selectedFormat={selectedFormat}
        seats={bookedSeats}
        totalPrice={bookedTotalPrice}
        onClose={handleCloseSuccess}
      />
    );
  } else if (activeView === "tickets") {
    screenContent = <TicketsScreen />;
  } else if (activeView === "favorites") {
    screenContent = <FavoritesScreen />;
  } else if (activeView === "profile") {
    screenContent = <ProfileScreen />;
  } else {
    screenContent = <HomeScreen onSelectMovie={handleSelectMovie} />;
  }

  return (
    <div className="relative w-full h-full flex flex-col bg-[#F7F8FD]">
      <div className="flex-1 w-full h-full relative overflow-hidden">
        {screenContent}
      </div>
      <Footer />
    </div>
  );
}
