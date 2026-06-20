"use client";

import { useState } from "react";
import Image from "next/image";

// Mock Movie Data for "Now Showing" (from the reference image)
const nowShowingMovies = [
  {
    id: 1,
    title: "Meg 2: The Trench",
    genre: "Action, Sci-fi, Horror",
    rating: "4.5",
  },
  {
    id: 2,
    title: "The Nun II",
    genre: "Horror",
    rating: "4.5",
  },
  {
    id: 3,
    title: "Fast X",
    genre: "Action, Adventure",
    rating: "4.5",
  },
  {
    id: 4,
    title: "John Wick: Chapter 4",
    genre: "Action, Thriller",
    rating: "4.8",
  },
];

// Mock Movie Data for "Coming Soon"
const comingSoonMovies = [
  {
    id: 5,
    title: "Dune: Part Two",
    genre: "Adventure, Sci-Fi",
    rating: "4.9",
  },
  {
    id: 6,
    title: "Oppenheimer",
    genre: "Drama, History",
    rating: "4.8",
  },
  {
    id: 7,
    title: "Barbie",
    genre: "Comedy, Fantasy",
    rating: "4.2",
  },
  {
    id: 8,
    title: "Spider-Man: Beyond",
    genre: "Action, Sci-Fi",
    rating: "4.9",
  },
];

// Mock Theater Data (from the reference image)
const theaters = [
  {
    id: 1,
    name: "The Grandview",
    location: "Camp Aguinaldo, Quezon City",
    rate: "₹320 - ₹450",
  },
  {
    id: 2,
    name: "Play Loft",
    location: "Aurora Boulevard, Santa Mesa",
    rate: "₹300 - ₹430",
  },
  {
    id: 3,
    name: "CinemaOne",
    location: "A. Cruz, Pasay City",
    rate: "₹280 - ₹400",
  },
];

export default function HomeScreen() {
  const [activeTab, setActiveTab] = useState<"now_showing" | "coming_soon">("now_showing");

  const activeMovies = activeTab === "now_showing" ? nowShowingMovies : comingSoonMovies;

  return (
    <div className="relative w-full h-full flex flex-col bg-[#F7F8FD]">
      {/* Hero Banner Image */}
      <div className="relative w-full h-[220px] shrink-0">
        <Image
          src="/assets/home/Hero Image.png"
          alt="Hero Banner"
          fill
          className="object-cover"
          priority
        />
      </div>

      {/* Search Icon: top: 39px, right: 29px */}
      <button
        onClick={() => console.log("Search clicked")}
        className="absolute top-[39px] right-[29px] w-[28px] h-[28px] z-20 cursor-pointer flex items-center justify-center"
      >
        <Image
          src="/assets/Search.svg"
          alt="Search"
          width={28}
          height={28}
          priority
        />
      </button>

      {/* Tabs Container: top: 244px, left/right margins: 26px, height: 20px */}
      <div className="absolute top-[244px] left-[26px] right-[26px] h-[20px] flex items-center justify-between">
        {/* Left side: Now Showing & Coming Soon tabs */}
        <div className="flex items-center gap-[24px] h-full">
          <button
            onClick={() => setActiveTab("now_showing")}
            className={`h-full flex items-center justify-center cursor-pointer transition-all duration-150 border-b-2 pb-[2px] ${
              activeTab === "now_showing"
                ? "text-[#4F46E5] border-[#4F46E5]"
                : "text-[#64748B] border-transparent"
            } text-[12px] font-bold font-inter`}
          >
            Now Showing
          </button>
          
          <button
            onClick={() => setActiveTab("coming_soon")}
            className={`h-full flex items-center justify-center cursor-pointer transition-all duration-150 border-b-2 pb-[2px] ${
              activeTab === "coming_soon"
                ? "text-[#4F46E5] border-[#4F46E5]"
                : "text-[#64748B] border-transparent"
            } text-[12px] font-bold font-inter`}
          >
            Coming Soon
          </button>
        </div>

        {/* Right side: View All link */}
        <button
          onClick={() => console.log("View All clicked")}
          className="h-full flex items-center justify-center cursor-pointer text-[#4F46E5] text-[12px] font-normal font-inter"
        >
          View All
        </button>
      </div>

      {/* Horizontal Movies List Container: top: 284px, left padding: 26px, right padding: 26px, height: 230px */}
      <div className="absolute top-[284px] left-0 right-0 h-[230px] flex overflow-x-auto overflow-y-hidden gap-[16px] pl-[26px] pr-[26px] scrollbar-none">
        {activeMovies.map((movie) => (
          <div key={movie.id} className="w-[106px] h-[230px] flex flex-col shrink-0 overflow-hidden">
            {/* Banner Image Card: width: 106px, height: 158px, border-radius: 5px */}
            <div className="relative w-[106px] h-[158px] rounded-[5px] overflow-hidden shrink-0">
              <Image
                src="/assets/home/Hero Image.png"
                alt={movie.title}
                fill
                className="object-cover"
              />
              
              {/* Rating Tag: bottom right, height: 22px, width: 51px, bg: black, border-radius top-left: 5px */}
              <div className="absolute bottom-0 right-0 w-[51px] h-[22px] bg-[#0B0A11]/90 rounded-tl-[5px] rounded-br-[5px] flex items-center justify-center gap-[4px] z-10">
                {/* White Star SVG */}
                <svg
                  className="w-[10px] h-[10px] fill-white"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                </svg>
                
                {/* Rating text: Inter 600 SemiBold 12px */}
                <span className="text-white text-[12px] font-semibold font-inter">
                  {movie.rating}
                </span>
              </div>
            </div>

            {/* Text details area */}
            <div className="flex flex-col mt-[8px]">
              {/* Movie Title: Inter 600 SemiBold 14px */}
              <h3 className="text-[14px] font-semibold text-zinc-900 font-inter leading-[18px] line-clamp-2">
                {movie.title}
              </h3>
              
              {/* Movie Genre/Tags: Inter 400 Regular 12px */}
              <p className="text-[12px] font-normal text-zinc-500 font-inter mt-[2px] leading-[15px] line-clamp-2">
                {movie.genre}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Movie Theaters Title Bar: top: 539px, left/right margins: 26px, height: 20px */}
      <div className="absolute top-[539px] left-[26px] right-[26px] h-[20px] flex items-center justify-between">
        <h2 className="text-[16px] font-bold text-zinc-900 font-inter">Movie Theatres</h2>
        <button
          onClick={() => console.log("View All Theaters clicked")}
          className="text-[#4F46E5] text-[12px] font-normal font-inter cursor-pointer"
        >
          View All
        </button>
      </div>

      {/* Theaters List Container: top: 575px, left/right: 26px, bottom: 16px, scrollable */}
      <div className="absolute top-[575px] left-[26px] right-[26px] bottom-[16px] flex flex-col gap-[8px] overflow-y-auto scrollbar-none">
        {theaters.map((theater) => (
          <div key={theater.id} className="w-full h-[73px] flex items-center shrink-0">
            {/* Theater Logo: Square of 73px, border radius: 5px */}
            <div className="w-[73px] h-[73px] rounded-[5px] overflow-hidden shrink-0 relative bg-white border border-zinc-100 flex items-center justify-center">
              <Image
                src="/assets/home/Hero Image.png"
                alt={theater.name}
                fill
                className="object-cover opacity-80"
              />
            </div>

            {/* Theater Details: gap of 20px from logo */}
            <div className="ml-[20px] flex-1 flex flex-col justify-between h-full py-[1px]">
              {/* Theater Name: Inter 600 SemiBold 14px */}
              <h3 className="text-[14px] font-semibold text-zinc-900 font-inter leading-[18px] truncate">
                {theater.name}
              </h3>

              {/* Theater Location: Inter 400 Regular 12px, color: #64748B */}
              <div className="flex items-center gap-[4px] mt-[1px]">
                <svg
                  className="w-[12px] h-[12px] text-[#64748B] shrink-0"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span className="text-[12px] font-normal text-[#64748B] font-inter truncate leading-[15px]">
                  {theater.location}
                </span>
              </div>

              {/* Rate Range: Inter 600 SemiBold 14px, color: #64748B */}
              <p className="text-[14px] font-semibold text-[#64748B] font-inter leading-none mt-[4px]">
                {theater.rate}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
