"use client";

import { useState } from "react";
import HomeScreen from "@/screens/HomeScreen";
import MovieDetailsScreen from "@/screens/MovieDetailsScreen";
import SelectTheatreScreen from "@/screens/SelectTheatreScreen";
import SelectScheduleScreen from "@/screens/SelectScheduleScreen";
import SelectSeatsScreen from "@/screens/SelectSeatsScreen";
import BookingSummaryScreen from "@/screens/BookingSummaryScreen";
import CheckoutScreen from "@/screens/CheckoutScreen";

export default function Home() {
  const [selectedMovie, setSelectedMovie] = useState<any | null>(null);
  const [selectedTheatre, setSelectedTheatre] = useState<any | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [selectedFormat, setSelectedFormat] = useState<string>("");
  const [bookedSeats, setBookedSeats] = useState<string[]>([]);
  const [bookedTotalPrice, setBookedTotalPrice] = useState<number>(0);
  const [activeView, setActiveView] = useState<"home" | "details" | "select_theatre" | "select_schedule" | "select_seats" | "booking_summary" | "checkout">("home");

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

  return <HomeScreen onSelectMovie={handleSelectMovie} />;
}
