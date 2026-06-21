"use client";

import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import useSWR from "swr";
import { fetcher } from "@/store/fetcher";

interface Movie {
  _id: string;
  title: string;
  genre: string;
  rating: number;
  posterUrl: string;
  showingType: "now_showing" | "coming_soon";
}

interface Theater {
  _id: string;
  name: string;
  location: string;
  rateRange: string;
  imageUrl: string;
}

interface HomeScreenProps {
  onSelectMovie: (movie: any) => void;
}

export default function HomeScreen({ onSelectMovie }: HomeScreenProps) {
  const [activeTab, setActiveTab] = useState<"now_showing" | "coming_soon">("now_showing");

  // Drag-to-scroll horizontal movies list
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragged, setDragged] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeftState, setScrollLeftState] = useState(0);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!scrollRef.current) return;
    setIsDragging(true);
    setDragged(false);
    setStartX(e.pageX - scrollRef.current.offsetLeft);
    setScrollLeftState(scrollRef.current.scrollLeft);
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !scrollRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX) * 1.5;
    if (Math.abs(walk) > 5) {
      setDragged(true);
    }
    scrollRef.current.scrollLeft = scrollLeftState - walk;
  };

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";

  const { data: movies = [], isLoading: moviesLoading } = useSWR<Movie[]>(`${API_URL}/api/movies`, fetcher);
  const { data: theaters = [], isLoading: theatersLoading } = useSWR<Theater[]>(`${API_URL}/api/theaters`, fetcher);

  const loading = moviesLoading || theatersLoading;

  const nowShowingMovies = movies.filter((m) => m.showingType === "now_showing");
  const comingSoonMovies = movies.filter((m) => m.showingType === "coming_soon");
  const activeMovies = activeTab === "now_showing" ? nowShowingMovies : comingSoonMovies;

  return (
    <div className="w-full h-full flex flex-col bg-[#F7F8FD] overflow-y-auto scrollbar-none relative">
      {/* Hero Banner Image */}
      <div className="relative w-full h-55 shrink-0">
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
        className="absolute top-9.75 right-7.25 w-7 h-7 z-20 cursor-pointer flex items-center justify-center"
      >
        <Image
          src="/assets/Search.svg"
          alt="Search"
          width={28}
          height={28}
          priority
        />
      </button>

      {/* Tabs Container: margins, height: 20px */}
      <div className="mt-6 px-6.5 h-5 flex items-center justify-between shrink-0">
        {/* Left side: Now Showing & Coming Soon tabs */}
        <div className="flex items-center gap-6 h-full">
          <button
            onClick={() => setActiveTab("now_showing")}
            className={`h-full flex items-center justify-center cursor-pointer transition-all duration-150 border-b-2 pb-0.5 ${
              activeTab === "now_showing"
                ? "text-[#4F46E5] border-[#4F46E5]"
                : "text-[#64748B] border-transparent"
            } text-[12px] font-bold font-inter`}
          >
            Now Showing
          </button>
          
          <button
            onClick={() => setActiveTab("coming_soon")}
            className={`h-full flex items-center justify-center cursor-pointer transition-all duration-150 border-b-2 pb-0.5 ${
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

      {/* Horizontal Movies List Container */}
      <div 
        ref={scrollRef}
        onMouseDown={handleMouseDown}
        onMouseLeave={handleMouseLeave}
        onMouseUp={handleMouseUp}
        onMouseMove={handleMouseMove}
        className="mt-5 h-57.5 flex overflow-x-auto overflow-y-hidden gap-4 pl-6.5 pr-6.5 scrollbar-none shrink-0 cursor-grab active:cursor-grabbing select-none"
      >
        {loading ? (
          <div className="w-full h-full flex items-center justify-center text-[12px] text-zinc-500 font-inter font-medium">
            Loading movies...
          </div>
        ) : activeMovies.length > 0 ? (
          activeMovies.map((movie) => (
            <div 
              key={movie._id} 
              onClick={() => {
                if (!dragged) {
                  onSelectMovie(movie);
                }
              }}
              className="w-26.5 h-57.5 flex flex-col shrink-0 overflow-hidden cursor-pointer"
            >
              {/* Banner Image Card: width: 106px, height: 158px, border-radius: 5px */}
              <div className="relative w-26.5 h-39.5 rounded-[5px] overflow-hidden shrink-0 bg-zinc-200">
                <img
                  src={movie.posterUrl || "/assets/home/Hero Image.png"}
                  alt={movie.title}
                  className="absolute inset-0 w-full h-full object-cover"
                />
                
                {/* Rating Tag: bottom right, height: 22px, width: 51px, bg: black, border-radius top-left: 5px */}
                <div className="absolute bottom-0 right-0 w-12.75 h-5.5 bg-[#0B0A11]/90 rounded-tl-[5px] rounded-br-[5px] flex items-center justify-center gap-1 z-10">
                  {/* White Star SVG */}
                  <svg
                    className="w-2.5 h-2.5 fill-white"
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
              <div className="flex flex-col mt-2">
                {/* Movie Title: Inter 600 SemiBold 14px */}
                <h3 className="text-[14px] font-semibold text-zinc-900 font-inter leading-4.5 line-clamp-2">
                  {movie.title}
                </h3>
                
                {/* Movie Genre/Tags: Inter 400 Regular 12px */}
                <p className="text-[12px] font-normal text-zinc-500 font-inter mt-0.5 leading-3.75 line-clamp-2">
                  {movie.genre}
                </p>
              </div>
            </div>
          ))
        ) : (
          <div className="w-full h-full flex items-center justify-center text-[12px] text-zinc-500 font-inter font-medium">
            No movies showing.
          </div>
        )}
      </div>

      {/* Movie Theaters Title Bar */}
      <div className="mt-6.25 px-6.5 h-5 flex items-center justify-between shrink-0">
        <h2 className="text-[16px] font-bold text-zinc-900 font-inter">Movie Theatres</h2>
        <button
          onClick={() => console.log("View All Theaters clicked")}
          className="text-[#4F46E5] text-[12px] font-normal font-inter cursor-pointer"
        >
          View All
        </button>
      </div>

      {/* Theaters List Container */}
      <div className="mt-4 px-6.5 flex flex-col gap-4 pb-27.25 shrink-0">
        {loading ? (
          <div className="w-full flex items-center justify-center text-[12px] text-zinc-500 font-inter py-5">
            Loading theaters...
          </div>
        ) : theaters.length > 0 ? (
          theaters.map((theater) => (
            <div key={theater._id} className="w-full h-18.25 flex items-center shrink-0">
              {/* Theater Logo: Square of 73px, border radius: 5px */}
              <div className="w-18.25 h-18.25 rounded-[5px] overflow-hidden shrink-0 relative bg-white border border-zinc-100 flex items-center justify-center">
                <img
                  src={theater.imageUrl || "/assets/home/Hero Image.png"}
                  alt={theater.name}
                  className="absolute inset-0 w-full h-full object-cover opacity-80"
                />
              </div>

              {/* Theater Details: gap of 20px from logo */}
              <div className="ml-5 flex-1 flex flex-col justify-between h-full py-px">
                <div className="flex flex-col gap-1">
                  {/* Theater Name: Inter 600 SemiBold 14px */}
                  <h3 className="text-[14px] font-semibold text-zinc-900 font-inter leading-4.5 truncate">
                    {theater.name}
                  </h3>

                  {/* Theater Location: Inter 400 Regular 12px, color: #64748B */}
                  <div className="flex items-center gap-1">
                    <svg
                      className="w-3 h-3 text-[#64748B] shrink-0"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span className="text-[12px] font-normal text-[#64748B] font-inter truncate leading-3.75">
                      {theater.location}
                    </span>
                  </div>
                </div>

                {/* Rate Range: Inter 600 SemiBold 14px, color: #64748B */}
                <p className="text-[14px] font-semibold text-[#64748B] font-inter leading-none pb-2.5">
                  {theater.rateRange}
                </p>
              </div>
            </div>
          ))
        ) : (
          <div className="w-full flex items-center justify-center text-[12px] text-zinc-500 font-inter py-5">
            No theaters active.
          </div>
        )}
      </div>
    </div>
  );
}
