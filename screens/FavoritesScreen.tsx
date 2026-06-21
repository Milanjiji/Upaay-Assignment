"use client";

import { useState } from "react";
import { useDispatch } from "react-redux";
import { navigateTo } from "@/store/slices/navigationSlice";
import { setSelectedMovie } from "@/store/slices/bookingSlice";
import useSWR from "swr";
import { fetcher } from "@/store/fetcher";

interface Movie {
  _id: string;
  title: string;
  genre: string;
  rating: number;
  posterUrl: string;
}

export default function FavoritesScreen() {
  const dispatch = useDispatch();

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";

  // Fetch favorites from backend using SWR
  const { data: favorites = [], isLoading: loading, mutate } = useSWR<Movie[]>(
    `${API_URL}/api/favorites`,
    fetcher
  );

  const handleBookMovie = (movie: Movie) => {
    dispatch(setSelectedMovie(movie));
    dispatch(navigateTo("details"));
  };

  const handleRemoveFavorite = async (movieId: string) => {
    try {
      const cookies = document.cookie.split(";");
      const tokenCookie = cookies.find(c => c.trim().startsWith("token="));
      const tokenVal = tokenCookie ? tokenCookie.split("=")[1] : "";
      if (!tokenVal) return;

      // Optimistic update: hide item immediately in the UI
      const updatedFavorites = favorites.filter((m) => m._id !== movieId);
      mutate(updatedFavorites, false);

      const res = await fetch(`${API_URL}/api/favorites/toggle`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": tokenVal
        },
        body: JSON.stringify({ movieId })
      });

      if (!res.ok) {
        // Rollback on failure
        mutate();
      }
    } catch (e) {
      console.error("Failed to remove favorite", e);
      mutate();
    }
  };

  return (
    <div className="relative w-full h-full flex flex-col bg-[#F7F8FD]">
      {/* Title Header */}
      <div className="absolute top-7 left-6.5 right-6.5 h-7.5 flex items-center justify-between">
        <h1 className="text-[20px] font-bold text-zinc-900 font-inter">Favorites</h1>
      </div>

      {/* Favorites List Container */}
      <div className="absolute top-19.5 left-6.5 right-6.5 bottom-22.25 overflow-y-auto scrollbar-none pb-4">
        {loading ? (
          <div className="w-full flex-1 flex flex-col items-center justify-center py-25">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-[#4F46E5] mb-3" />
            <span className="text-[13px] font-medium text-[#64748B] font-inter">Loading favorites...</span>
          </div>
        ) : favorites.length > 0 ? (
          <div className="grid grid-cols-2 gap-4 w-full">
            {favorites.map((movie) => (
              <div
                key={movie._id}
                onClick={() => handleBookMovie(movie)}
                className="w-full flex flex-col overflow-hidden cursor-pointer"
              >
                {/* Banner Image Card: aspect-106/158, border-radius: 5px */}
                <div className="relative w-full aspect-106/158 rounded-[5px] overflow-hidden shrink-0 bg-zinc-200">
                  <img
                    src={movie.posterUrl || "/assets/home/Hero Image.png"}
                    alt={movie.title}
                    className="absolute inset-0 w-full h-full object-cover"
                  />

                  {/* Heart Toggle Button on Top-Right */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveFavorite(movie._id);
                    }}
                    className="absolute top-2 right-2 w-6.5 h-6.5 rounded-full bg-[#0B0A11]/60 flex items-center justify-center cursor-pointer text-[#EF4444] hover:text-[#DC2626] transition-all z-20"
                  >
                    <svg className="w-3 h-3 fill-current" viewBox="0 0 24 24">
                      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                    </svg>
                  </button>

                  {/* Rating Tag: bottom right, height: 22px, width: 51px, bg: black, border-radius top-left: 5px */}
                  <div className="absolute bottom-0 right-0 w-12.75 h-5.5 bg-[#0B0A11]/90 rounded-tl-[5px] rounded-br-[5px] flex items-center justify-center gap-1 z-10">
                    {/* White Star SVG */}
                    <svg className="w-2.5 h-2.5 fill-white" viewBox="0 0 24 24">
                      <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                    </svg>
                    {/* Rating text */}
                    <span className="text-white text-[12px] font-semibold font-inter">
                      {movie.rating}
                    </span>
                  </div>
                </div>

                {/* Text details area */}
                <div className="flex flex-col mt-2">
                  {/* Movie Title: Inter 600 SemiBold 14px */}
                  <h3 className="text-[14px] font-semibold text-zinc-900 font-inter leading-4.5 line-clamp-2">
                    {movie.title}
                  </h3>

                  {/* Movie Genre/Tags: Inter 400 Regular 12px */}
                  <p className="text-[12px] font-normal text-zinc-500 font-inter mt-0.5 leading-3.75 line-clamp-1">
                    {movie.genre}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center flex-1 py-15 text-center w-full">
            <div className="w-25 h-25 bg-zinc-100 rounded-full flex items-center justify-center mb-5">
              <svg className="w-12 h-12 text-zinc-400" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
              </svg>
            </div>
            
            <h2 className="text-[16px] font-bold text-zinc-800 font-inter mb-1.5">
              No Favorites Yet
            </h2>
            <p className="text-[13px] font-normal text-zinc-500 font-inter max-w-50 leading-relaxed">
              Tap the heart icon on a movie details screen to save it here.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
