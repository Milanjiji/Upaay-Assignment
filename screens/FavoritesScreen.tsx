"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useDispatch } from "react-redux";
import { navigateTo } from "@/store/slices/navigationSlice";
import { setSelectedMovie } from "@/store/slices/bookingSlice";

interface Movie {
  id: number;
  title: string;
  genre: string;
  rating: string;
  image?: string;
}

const defaultFavorites: Movie[] = [
  {
    id: 1,
    title: "Meg 2: The Trench",
    genre: "Action, Sci-fi, Horror",
    rating: "4.5",
  },
  {
    id: 4,
    title: "John Wick: Chapter 4",
    genre: "Action, Thriller",
    rating: "4.8",
  },
];

export default function FavoritesScreen() {
  const dispatch = useDispatch();
  const [favorites, setFavorites] = useState<Movie[]>([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("favorite_movies");
      if (stored) {
        setFavorites(JSON.parse(stored));
      } else {
        // Populate default favorites for a better UX initially
        localStorage.setItem("favorite_movies", JSON.stringify(defaultFavorites));
        setFavorites(defaultFavorites);
      }
    } catch (e) {
      setFavorites(defaultFavorites);
    }
  }, []);

  const handleBookMovie = (movie: Movie) => {
    dispatch(setSelectedMovie(movie));
    dispatch(navigateTo("details"));
  };

  const handleRemoveFavorite = (movieId: number) => {
    const updated = favorites.filter((m) => m.id !== movieId);
    setFavorites(updated);
    localStorage.setItem("favorite_movies", JSON.stringify(updated));
  };

  return (
    <div className="relative w-full h-full flex flex-col bg-[#F7F8FD]">
      {/* Title Header */}
      <div className="absolute top-[28px] left-[26px] right-[26px] h-[30px] flex items-center justify-between">
        <h1 className="text-[20px] font-bold text-zinc-900 font-inter">Favorites</h1>
      </div>

      {/* Favorites List Container */}
      <div className="absolute top-[78px] left-[26px] right-[26px] bottom-[89px] overflow-y-auto scrollbar-none flex flex-col gap-[12px] pb-[16px]">
        {favorites.length > 0 ? (
          favorites.map((movie) => (
            <div
              key={movie.id}
              className="w-full h-[96px] bg-white rounded-[10px] border border-zinc-150 shadow-[0_2px_8px_rgba(0,0,0,0.01)] flex overflow-hidden shrink-0 relative"
            >
              {/* Image Banner on the left (w: 80px) */}
              <div className="w-[80px] h-full shrink-0 relative bg-zinc-100">
                <Image
                  src="/assets/home/Hero Image.png"
                  alt={movie.title}
                  fill
                  className="object-cover"
                />
              </div>

              {/* Text/Details area on the right */}
              <div className="flex-1 p-[12px] flex flex-col justify-between pr-[40px]">
                <div className="flex flex-col gap-[2px]">
                  {/* Movie Title */}
                  <h3 className="text-[13px] font-bold text-zinc-950 font-inter leading-tight line-clamp-1">
                    {movie.title}
                  </h3>
                  
                  {/* Genre */}
                  <p className="text-[11px] font-normal text-zinc-500 font-inter truncate leading-none">
                    {movie.genre}
                  </p>
                </div>

                {/* Rating & Action */}
                <div className="flex items-center justify-between">
                  {/* Rating */}
                  <div className="flex items-center gap-[3px] text-zinc-800 text-[11px] font-semibold font-inter">
                    <svg className="w-[11px] h-[11px] fill-zinc-800" viewBox="0 0 24 24">
                      <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                    </svg>
                    <span>{movie.rating}</span>
                  </div>

                  {/* Book Now Button */}
                  <button
                    onClick={() => handleBookMovie(movie)}
                    className="px-[12px] py-[5px] bg-[#4F46E5] text-white text-[11px] font-bold rounded cursor-pointer hover:bg-[#4338ca] transition-colors font-inter"
                  >
                    Book Now
                  </button>
                </div>
              </div>

              {/* Remove Favorite Button (cross at the top-right corner) */}
              <button
                onClick={() => handleRemoveFavorite(movie.id)}
                className="absolute top-[8px] right-[8px] w-[20px] h-[20px] rounded-full hover:bg-zinc-100 flex items-center justify-center cursor-pointer text-zinc-400 hover:text-zinc-600 transition-colors"
              >
                <svg className="w-[12px] h-[12px]" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center flex-1 py-[60px] text-center">
            <div className="w-[100px] h-[100px] bg-zinc-100 rounded-full flex items-center justify-center mb-[20px]">
              <svg className="w-[48px] h-[48px] text-zinc-400" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
              </svg>
            </div>
            
            <h2 className="text-[16px] font-bold text-zinc-800 font-inter mb-[6px]">
              No Favorites Yet
            </h2>
            <p className="text-[13px] font-normal text-zinc-500 font-inter max-w-[200px] leading-relaxed">
              Tap the heart icon on a movie details screen to save it here.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
