"use client";

import { useState } from "react";
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

import HomeScreen from "@/screens/HomeScreen";
import MovieDetailsScreen from "@/screens/MovieDetailsScreen";
import SelectTheatreScreen from "@/screens/SelectTheatreScreen";
import SelectScheduleScreen from "@/screens/SelectScheduleScreen";
import SelectSeatsScreen from "@/screens/SelectSeatsScreen";
import BookingSummaryScreen from "@/screens/BookingSummaryScreen";
import CheckoutScreen from "@/screens/CheckoutScreen";
import PaymentSuccessScreen from "@/screens/PaymentSuccessScreen";

export default function Home() {
  const dispatch = useDispatch();

  const activeView = useSelector((state: RootState) => state.navigation.activeView);
  const selectedMovie = useSelector((state: RootState) => state.booking.selectedMovie);
  const selectedTheatre = useSelector((state: RootState) => state.booking.selectedTheatre);
  const selectedDate = useSelector((state: RootState) => state.booking.selectedDate);
  const selectedTime = useSelector((state: RootState) => state.booking.selectedTime);
  const selectedFormat = useSelector((state: RootState) => state.booking.selectedFormat);
  const bookedSeats = useSelector((state: RootState) => state.booking.bookedSeats);
  const bookedTotalPrice = useSelector((state: RootState) => state.booking.bookedTotalPrice);

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

  const handleGetTickets = (format: string, time: string) => {
    dispatch(setSelectedSchedule({ format, time }));
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

  const handleCompletePayment = () => {
    dispatch(navigateTo("payment_success"));
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
      `🎬 Movie: ${selectedMovie.title}\n` +
      `🏛️ Theater: ${selectedTheatre.name}\n` +
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

  if (activeView === "details" && selectedMovie) {
    return (
      <MovieDetailsScreen
        movie={selectedMovie}
        onClose={handleCloseDetails}
        onBookTickets={handleBookTickets}
      />
    );
  }

  if (activeView === "select_theatre" && selectedMovie) {
    return (
      <SelectTheatreScreen
        movie={selectedMovie}
        onBack={handleBackFromTheatre}
        onCancel={handleCancelFromTheatre}
        onSelectTheatre={handleSelectTheatre}
      />
    );
  }

  if (activeView === "select_schedule" && selectedMovie && selectedTheatre) {
    return (
      <SelectScheduleScreen
        movie={selectedMovie}
        theater={selectedTheatre}
        selectedDate={selectedDate}
        onBack={handleBackFromSchedule}
        onCancel={handleCancelFromSchedule}
        onGetTickets={handleGetTickets}
      />
    );
  }

  if (activeView === "select_seats" && selectedMovie && selectedTheatre) {
    return (
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
  }

  if (activeView === "booking_summary" && selectedMovie && selectedTheatre) {
    return (
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
  }

  if (activeView === "checkout" && selectedMovie && selectedTheatre) {
    return (
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
  }

  if (activeView === "payment_success" && selectedMovie && selectedTheatre) {
    return (
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
  }

  return <HomeScreen onSelectMovie={handleSelectMovie} />;
}
