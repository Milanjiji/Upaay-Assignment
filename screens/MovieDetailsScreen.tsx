"use client";

import Image from "next/image";

interface CastMember {
  name: string;
  character: string;
  image: string;
}

interface Movie {
  id: number;
  title: string;
  genre: string;
  rating: string;
  pgRating?: string;
  description?: string;
  formats?: string[];
  releaseDate?: string;
  cast?: CastMember[];
}

interface MovieDetailsScreenProps {
  movie: Movie;
  onClose: () => void;
  onBookTickets: () => void;
}

export default function MovieDetailsScreen({ movie, onClose, onBookTickets }: MovieDetailsScreenProps) {
  const description = movie.description || "A research team encounters multiple threats while exploring the depths of the ocean, including a malevolent mining operation.";
  const formats = movie.formats || ["2D", "3D"];
  const releaseDate = movie.releaseDate || "10 June 2026";
  const pgRating = movie.pgRating || "PG-13";
  
  const castList: CastMember[] = movie.cast || [
    { name: "Jason Statham", character: "Jonas Taylor", image: "/assets/home/Hero Image.png" },
    { name: "Jing Wu", character: "Jiuming Zhang", image: "/assets/home/Hero Image.png" },
    { name: "Shuya Sophia", character: "Meiying", image: "/assets/home/Hero Image.png" },
  ];

  return (
    <div className="relative w-full h-full flex flex-col bg-[#F7F8FD]">
      {/* Hero Banner Image */}
      <div className="relative w-full h-[196px] shrink-0">
        <Image
          src="/assets/home/Hero Image.png"
          alt={movie.title}
          fill
          className="object-cover"
          priority
        />
      </div>

      {/* Close button: left 32px, top 21px */}
      <button
        onClick={onClose}
        className="absolute left-[32px] top-[21px] z-20 cursor-pointer text-white font-semibold text-[14px] font-inter"
      >
        Close
      </button>

      {/* Heart Icon top right: Vector-2.svg */}
      <button
        onClick={() => console.log("Favorite clicked")}
        className="absolute right-[29px] top-[21px] z-20 cursor-pointer w-[22px] h-[31px] flex items-center justify-center"
      >
        <Image
          src="/assets/Vector-2.svg"
          alt="Favorite"
          width={22}
          height={31}
        />
      </button>

      {/* Main Title Bar: top: 213px, left/right margins: 26px */}
      <div className="absolute top-[213px] left-[26px] right-[26px] flex items-start justify-between">
        {/* Title and Genre and PG-13 */}
        <div className="flex flex-col flex-1 pr-[8px]">
          <div className="flex items-center gap-[8px] flex-wrap">
            <h1 className="text-[16px] font-semibold text-zinc-900 font-inter leading-tight">
              {movie.title}
            </h1>
            <span className="border border-[#2F81CD] text-[#2F81CD] text-[12px] font-normal font-inter rounded-[5px] px-[7px] py-[3px] shrink-0 leading-none">
              {pgRating}
            </span>
          </div>
          <p className="text-[14px] font-normal text-[#64748B] font-inter mt-[4px] leading-tight">
            {movie.genre}
          </p>
        </div>

        {/* Rating star on the right: Inter 400 Regular 14px */}
        <div className="flex items-center gap-[4px] shrink-0 mt-[2px]">
          <svg className="w-[14px] h-[14px] fill-zinc-800" viewBox="0 0 24 24">
            <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
          </svg>
          <span className="text-zinc-800 text-[14px] font-normal font-inter leading-none">
            {movie.id === 4 ? "4.8" : "5.1"}
          </span>
        </div>
      </div>

      {/* Description: top: 273px, left/right: 26px */}
      <p className="absolute top-[273px] left-[26px] right-[26px] text-[14px] font-normal text-[#64748B] font-inter leading-[20px] line-clamp-3">
        {description}
      </p>

      {/* Format Available: top: 358px, gap between title and items: 20px */}
      <div className="absolute top-[358px] left-[26px] right-[26px] flex flex-col gap-[20px]">
        <h3 className="text-[16px] font-bold text-zinc-900 font-inter leading-none">
          Format Available
        </h3>
        <div className="flex gap-[8px]">
          {formats.map((format) => (
            <button
              key={format}
              className="px-[10px] py-[8px] border border-[#CED6E0] rounded-[5px] text-[#4F46E5] text-[12px] font-semibold font-inter cursor-pointer hover:bg-zinc-100 transition-colors leading-none"
            >
              {format}
            </button>
          ))}
        </div>
      </div>

      {/* Release Date: top: 448px, gap between title and items: 20px */}
      <div className="absolute top-[448px] left-[26px] right-[26px] flex flex-col gap-[20px]">
        <h3 className="text-[16px] font-bold text-zinc-900 font-inter leading-none">
          Release Date
        </h3>
        <p className="text-[14px] font-normal text-[#64748B] font-inter leading-none">
          {releaseDate}
        </p>
      </div>

      {/* Cast: top: 524px, gap between title and items: 20px */}
      <div className="absolute top-[524px] left-[26px] right-[26px] flex flex-col gap-[20px]">
        <h3 className="text-[16px] font-bold text-zinc-900 font-inter leading-none">
          Cast
        </h3>
        {/* Horizontal scroll of cast members */}
        <div className="flex items-center gap-[16px] overflow-x-auto scrollbar-none py-[2px]">
          {castList.map((actor, idx) => (
            <div key={idx} className="flex items-center gap-[8px] shrink-0">
              {/* Photo: 52px square, border radius 5px */}
              <div className="w-[52px] h-[52px] rounded-[5px] overflow-hidden shrink-0 relative bg-zinc-200">
                <Image
                  src={actor.image}
                  alt={actor.name}
                  fill
                  className="object-cover"
                />
              </div>
              {/* Actor & Character name: gap between them 2px */}
              <div className="flex flex-col gap-[2px]">
                <span className="text-[14px] font-normal text-zinc-900 font-inter leading-tight">
                  {actor.name}
                </span>
                <span className="text-[12px] font-normal text-zinc-500 font-inter leading-tight">
                  {actor.character}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Get Tickets Button: top: 655px, same as login (width: 345px, height: 37px) */}
      <button
        onClick={onBookTickets}
        className="absolute top-[655px] left-1/2 -translate-x-1/2 w-[345px] h-[37px] rounded-[5px] bg-[#4F46E5] text-[#FFFFFF] font-semibold text-[14px] flex items-center justify-center cursor-pointer font-inter hover:bg-[#4338ca] transition-colors"
      >
        Get Tickets
      </button>
    </div>
  );
}
