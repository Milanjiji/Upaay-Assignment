"use client";

import { createSlice, PayloadAction } from "@reduxjs/toolkit";

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
  imageUrl?: string;
}

interface BookingState {
  selectedMovie: Movie | null;
  selectedTheatre: Theater | null;
  selectedDate: string;
  selectedTime: string;
  selectedFormat: string;
  selectedShowtimeId: string;
  bookedSeats: string[];
  bookedTotalPrice: number;
  ticketPrice: number;
}

const initialState: BookingState = {
  selectedMovie: null,
  selectedTheatre: null,
  selectedDate: "",
  selectedTime: "",
  selectedFormat: "",
  selectedShowtimeId: "",
  bookedSeats: [],
  bookedTotalPrice: 0,
  ticketPrice: 280, // Default base price
};

export const bookingSlice = createSlice({
  name: "booking",
  initialState,
  reducers: {
    setSelectedMovie: (state, action: PayloadAction<Movie | null>) => {
      state.selectedMovie = action.payload;
    },
    setSelectedTheatreAndDate: (
      state,
      action: PayloadAction<{ theater: Theater; dateString: string }>
    ) => {
      state.selectedTheatre = action.payload.theater;
      state.selectedDate = action.payload.dateString;
    },
    setSelectedSchedule: (
      state,
      action: PayloadAction<{ format: string; time: string; showtimeId: string }>
    ) => {
      state.selectedFormat = action.payload.format;
      state.selectedTime = action.payload.time;
      state.selectedShowtimeId = action.payload.showtimeId;
    },
    toggleSeat: (state, action: PayloadAction<string>) => {
      const seatId = action.payload;
      if (state.bookedSeats.includes(seatId)) {
        state.bookedSeats = state.bookedSeats.filter((id) => id !== seatId);
      } else {
        state.bookedSeats.push(seatId);
      }
      state.bookedTotalPrice = state.bookedSeats.length * state.ticketPrice;
    },
    setBookedSeatsAndPrice: (
      state,
      action: PayloadAction<{ seats: string[]; totalPrice: number }>
    ) => {
      state.bookedSeats = action.payload.seats;
      state.bookedTotalPrice = action.payload.totalPrice;
    },
    resetBooking: (state) => {
      state.selectedMovie = null;
      state.selectedTheatre = null;
      state.selectedDate = "";
      state.selectedTime = "";
      state.selectedFormat = "";
      state.selectedShowtimeId = "";
      state.bookedSeats = [];
      state.bookedTotalPrice = 0;
    },
  },
});

export const {
  setSelectedMovie,
  setSelectedTheatreAndDate,
  setSelectedSchedule,
  toggleSeat,
  setBookedSeatsAndPrice,
  resetBooking,
} = bookingSlice.actions;

export default bookingSlice.reducer;
