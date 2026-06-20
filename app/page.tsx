"use client";

import { useState } from "react";
import HomeScreen from "@/screens/HomeScreen";
import MovieDetailsScreen from "@/screens/MovieDetailsScreen";
import SelectTheatreScreen from "@/screens/SelectTheatreScreen";
import SelectScheduleScreen from "@/screens/SelectScheduleScreen";
import SelectSeatsScreen from "@/screens/SelectSeatsScreen";
import BookingSummaryScreen from "@/screens/BookingSummaryScreen";
import CheckoutScreen from "@/screens/CheckoutScreen";
import PaymentSuccessScreen from "@/screens/PaymentSuccessScreen";

export default function Home() {
  const [selectedMovie, setSelectedMovie] = useState<any | null>(null);
  const [selectedTheatre, setSelectedTheatre] = useState<any | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [selectedFormat, setSelectedFormat] = useState<string>("");
  const [bookedSeats, setBookedSeats] = useState<string[]>([]);
  const [bookedTotalPrice, setBookedTotalPrice] = useState<number>(0);
  const [activeView, setActiveView] = useState<"home" | "details" | "select_theatre" | "select_schedule" | "select_seats" | "booking_summary" | "checkout" | "payment_success">("home");

  const handleSelectMovie = (movie: any) => {
    setSelectedMovie(movie);
    setActiveView("details");
  };

  const handleCloseDetails = () => {
    setSelectedMovie(null);
    setActiveView("home");
  };

  const handleBookTickets = () => {
    setActiveView("select_theatre");
  };

  const handleBackFromTheatre = () => {
    setActiveView("details");
  };

  const handleCancelFromTheatre = () => {
    resetBookingFlow();
  };

  const handleSelectTheatre = (theater: any, dateString: string) => {
    setSelectedTheatre(theater);
    setSelectedDate(dateString);
    setActiveView("select_schedule");
  };

  const handleBackFromSchedule = () => {
    setActiveView("select_theatre");
  };

  const handleCancelFromSchedule = () => {
    resetBookingFlow();
  };

  const handleGetTickets = (format: string, time: string) => {
    setSelectedFormat(format);
    setSelectedTime(time);
    setActiveView("select_seats");
  };

  const handleBackFromSeats = () => {
    setActiveView("select_schedule");
  };

  const handleCancelFromSeats = () => {
    resetBookingFlow();
  };

  const handleConfirmBooking = (seats: string[], totalPrice: number) => {
    setBookedSeats(seats);
    setBookedTotalPrice(totalPrice);
    setActiveView("booking_summary");
  };

  const handleBackFromSummary = () => {
    setActiveView("select_seats");
  };

  const handleCancelFromSummary = () => {
    resetBookingFlow();
  };

  const handleProceedToPayment = () => {
    setActiveView("checkout");
  };

  const handleBackFromCheckout = () => {
    setActiveView("booking_summary");
  };

  const handleCancelFromCheckout = () => {
    resetBookingFlow();
  };

  const handleCompletePayment = () => {
    setActiveView("payment_success");
  };

  const resetBookingFlow = () => {
    setSelectedMovie(null);
    setSelectedTheatre(null);
    setSelectedDate("");
    setSelectedTime("");
    setSelectedFormat("");
    setBookedSeats([]);
    setBookedTotalPrice(0);
    setActiveView("home");
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
        onClose={resetBookingFlow}
      />
    );
  }

  return <HomeScreen onSelectMovie={handleSelectMovie} />;
}
