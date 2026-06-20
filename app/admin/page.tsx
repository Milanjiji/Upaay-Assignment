"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";

interface Movie {
  _id: string;
  title: string;
  genre: string;
  rating: number;
  pgRating: string;
  description: string;
  formats: string[];
  releaseDate: string;
  showingType: string;
  posterUrl: string;
  cast: { name: string; character: string; image: string }[];
}

interface Theater {
  _id: string;
  name: string;
  location: string;
  rateRange: string;
  imageUrl: string;
  rows: string[];
  colsCount: number;
  verticalAisles: number[];
  horizontalAisles: string[];
}

interface Showtime {
  _id: string;
  movieId: Movie;
  theaterId: Theater;
  date: string;
  time: string;
  format: string;
  price: number;
  screenNumber: number;
}

interface Booking {
  _id: string;
  userId: { _id: string; name: string; email: string };
  movieId: { title: string; genre: string };
  theaterId: { name: string; location: string };
  showtimeId: { date: string; time: string; format: string };
  seats: string[];
  totalPrice: number;
  transactionDate: string;
}

export default function AdminPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const [activeTab, setActiveTab] = useState<"overview" | "movies" | "theaters" | "schedules" | "bookings">("overview");

  // Global lists
  const [movies, setMovies] = useState<Movie[]>([]);
  const [theaters, setTheaters] = useState<Theater[]>([]);
  const [schedules, setSchedules] = useState<Showtime[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);

  // Token helper
  const [token, setToken] = useState<string>("");

  // Modals / Overlays
  const [showMovieForm, setShowMovieForm] = useState(false);
  const [showTheaterForm, setShowTheaterForm] = useState(false);
  const [showScheduleForm, setShowScheduleForm] = useState(false);

  // Edit trackers
  const [editingMovieId, setEditingMovieId] = useState<string | null>(null);
  const [editingTheaterId, setEditingTheaterId] = useState<string | null>(null);
  const [editingCastIndex, setEditingCastIndex] = useState<number | null>(null);

  // Edit / Form states - Movie
  const [movieForm, setMovieForm] = useState({
    title: "",
    genre: "",
    rating: 5,
    pgRating: "PG-13",
    description: "",
    formats: "2D, 3D",
    releaseDate: "",
    showingType: "now_showing",
    posterUrl: "/assets/home/Hero Image.png",
    cast: [] as { name: string; character: string; image: string }[]
  });
  const [castName, setCastName] = useState("");
  const [castChar, setCastChar] = useState("");
  const [castImg, setCastImg] = useState("/assets/home/Hero Image.png");

  // Edit / Form states - Theater
  const [theaterForm, setTheaterForm] = useState({
    name: "",
    location: "",
    rateRange: "₹320 - ₹450",
    imageUrl: "/assets/home/Hero Image.png",
    rows: "A, B, C, D, E, F, G, H, J, K, L, M",
    colsCount: 30,
    verticalAisles: "10, 20",
    horizontalAisles: "J"
  });

  // Edit / Form states - Schedule
  const [scheduleForm, setScheduleForm] = useState({
    movieId: "",
    theaterId: "",
    date: "",
    time: "10:00 AM",
    format: "2D",
    price: 280,
    screenNumber: 1
  });

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";

  // Check auth cookie and fetch user role
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Read token from cookie
        const cookies = document.cookie.split(";");
        const tokenCookie = cookies.find(c => c.trim().startsWith("token="));
        const tokenVal = tokenCookie ? tokenCookie.split("=")[1] : "";
        
        if (!tokenVal) {
          router.push("/login");
          return;
        }
        
        setToken(tokenVal);

        // Call profile endpoint to verify admin role
        const res = await fetch(`${API_URL}/api/auth/me`, {
          headers: {
            "x-user-id": tokenVal
          }
        });

        if (!res.ok) {
          router.push("/");
          return;
        }

        const data = await res.json();
        if (data.user?.role !== "admin") {
          alert("Access Denied: Admin privileges required.");
          router.push("/");
          return;
        }

        setAuthorized(true);
        // Load stats/database lists
        await loadAllData(tokenVal);
      } catch (err) {
        console.error("Auth check failed", err);
        router.push("/");
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [router, API_URL]);

  const loadAllData = async (userIdToken: string) => {
    const headers = { "x-user-id": userIdToken };
    try {
      const [resMovies, resTheaters, resSchedules, resBookings] = await Promise.all([
        fetch(`${API_URL}/api/movies`, { headers }),
        fetch(`${API_URL}/api/theaters`, { headers }),
        fetch(`${API_URL}/api/showtimes`, { headers }),
        fetch(`${API_URL}/api/bookings`, { headers })
      ]);

      if (resMovies.ok) setMovies(await resMovies.json());
      if (resTheaters.ok) setTheaters(await resTheaters.json());
      if (resSchedules.ok) setSchedules(await resSchedules.json());
      if (resBookings.ok) setBookings(await resBookings.json());
    } catch (e) {
      console.error("Error loading database records", e);
    }
  };

  // Movie Actions
  const handleAddCast = () => {
    if (!castName || !castChar) return;
    if (editingCastIndex !== null) {
      const updatedCast = [...movieForm.cast];
      updatedCast[editingCastIndex] = { name: castName, character: castChar, image: castImg };
      setMovieForm(prev => ({
        ...prev,
        cast: updatedCast
      }));
      setEditingCastIndex(null);
    } else {
      setMovieForm(prev => ({
        ...prev,
        cast: [...prev.cast, { name: castName, character: castChar, image: castImg }]
      }));
    }
    setCastName("");
    setCastChar("");
    setCastImg("/assets/home/Hero Image.png");
  };

  const handleEditCast = (index: number) => {
    const castMember = movieForm.cast[index];
    if (!castMember) return;
    setEditingCastIndex(index);
    setCastName(castMember.name);
    setCastChar(castMember.character);
    setCastImg(castMember.image);
  };

  const handleEditMovie = (movie: Movie) => {
    setEditingMovieId(movie._id);
    setMovieForm({
      title: movie.title,
      genre: movie.genre,
      rating: movie.rating,
      pgRating: movie.pgRating,
      description: movie.description || "",
      formats: movie.formats.join(", "),
      releaseDate: movie.releaseDate ? movie.releaseDate.split("T")[0] : "",
      showingType: movie.showingType,
      posterUrl: movie.posterUrl,
      cast: movie.cast || []
    });
    setShowMovieForm(true);
  };

  const handleCloseMovieForm = () => {
    setShowMovieForm(false);
    setEditingMovieId(null);
    setEditingCastIndex(null);
    setCastName("");
    setCastChar("");
    setCastImg("/assets/home/Hero Image.png");
    setMovieForm({
      title: "",
      genre: "",
      rating: 5,
      pgRating: "PG-13",
      description: "",
      formats: "2D, 3D",
      releaseDate: "",
      showingType: "now_showing",
      posterUrl: "/assets/home/Hero Image.png",
      cast: []
    });
  };

  const handleCreateMovie = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        ...movieForm,
        formats: movieForm.formats.split(",").map(f => f.trim())
      };

      const url = editingMovieId 
        ? `${API_URL}/api/movies/${editingMovieId}` 
        : `${API_URL}/api/movies`;
        
      const method = editingMovieId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          "x-user-id": token
        },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to save movie");
      }

      alert(editingMovieId ? "Movie updated successfully!" : "Movie created successfully!");
      setShowMovieForm(false);
      setEditingMovieId(null);
      setEditingCastIndex(null);
      setCastName("");
      setCastChar("");
      setCastImg("/assets/home/Hero Image.png");
      // Reset form
      setMovieForm({
        title: "",
        genre: "",
        rating: 5,
        pgRating: "PG-13",
        description: "",
        formats: "2D, 3D",
        releaseDate: "",
        showingType: "now_showing",
        posterUrl: "/assets/home/Hero Image.png",
        cast: []
      });
      loadAllData(token);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleDeleteMovie = async (id: string) => {
    if (!confirm("Are you sure you want to delete this movie?")) return;
    try {
      const res = await fetch(`${API_URL}/api/movies/${id}`, {
        method: "DELETE",
        headers: { "x-user-id": token }
      });
      if (!res.ok) throw new Error("Failed to delete movie");
      alert("Movie deleted");
      loadAllData(token);
    } catch (err: any) {
      alert(err.message);
    }
  };

  // Theater Actions
  const handleEditTheater = (theater: Theater) => {
    setEditingTheaterId(theater._id);
    setTheaterForm({
      name: theater.name,
      location: theater.location,
      rateRange: theater.rateRange,
      imageUrl: theater.imageUrl,
      rows: theater.rows.join(", "),
      colsCount: theater.colsCount,
      verticalAisles: theater.verticalAisles.join(", "),
      horizontalAisles: theater.horizontalAisles.join(", ")
    });
    setShowTheaterForm(true);
  };

  const handleCloseTheaterForm = () => {
    setShowTheaterForm(false);
    setEditingTheaterId(null);
    setTheaterForm({
      name: "",
      location: "",
      rateRange: "₹320 - ₹450",
      imageUrl: "/assets/home/Hero Image.png",
      rows: "A, B, C, D, E, F, G, H, J, K, L, M",
      colsCount: 30,
      verticalAisles: "10, 20",
      horizontalAisles: "J"
    });
  };

  const handleCreateTheater = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        ...theaterForm,
        rows: theaterForm.rows.split(",").map(r => r.trim()),
        verticalAisles: theaterForm.verticalAisles.split(",").map(a => parseInt(a.trim(), 10)).filter(Boolean),
        horizontalAisles: theaterForm.horizontalAisles.split(",").map(h => h.trim()).filter(Boolean)
      };

      const url = editingTheaterId 
        ? `${API_URL}/api/theaters/${editingTheaterId}` 
        : `${API_URL}/api/theaters`;
        
      const method = editingTheaterId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          "x-user-id": token
        },
        body: JSON.stringify(payload)
      });

      if (!res.ok) throw new Error("Failed to save theater");
      alert(editingTheaterId ? "Theater updated successfully!" : "Theater created successfully!");
      setShowTheaterForm(false);
      setEditingTheaterId(null);
      setTheaterForm({
        name: "",
        location: "",
        rateRange: "₹320 - ₹450",
        imageUrl: "/assets/home/Hero Image.png",
        rows: "A, B, C, D, E, F, G, H, J, K, L, M",
        colsCount: 30,
        verticalAisles: "10, 20",
        horizontalAisles: "J"
      });
      loadAllData(token);
    } catch (e: any) {
      alert(e.message);
    }
  };

  const handleDeleteTheater = async (id: string) => {
    if (!confirm("Are you sure you want to delete this theater?")) return;
    try {
      const res = await fetch(`${API_URL}/api/theaters/${id}`, {
        method: "DELETE",
        headers: { "x-user-id": token }
      });
      if (!res.ok) throw new Error("Failed to delete theater");
      alert("Theater deleted");
      loadAllData(token);
    } catch (e: any) {
      alert(e.message);
    }
  };

  // Schedule Actions
  const handleCreateSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!scheduleForm.movieId || !scheduleForm.theaterId || !scheduleForm.date) {
      alert("Please fill all required schedule details.");
      return;
    }
    try {
      const res = await fetch(`${API_URL}/api/showtimes`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": token
        },
        body: JSON.stringify(scheduleForm)
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to create schedule");
      }

      alert("Showtime scheduled successfully!");
      setShowScheduleForm(false);
      loadAllData(token);
    } catch (e: any) {
      alert(e.message);
    }
  };

  const handleDeleteSchedule = async (id: string) => {
    if (!confirm("Cancel this showtime slot?")) return;
    try {
      const res = await fetch(`${API_URL}/api/showtimes/${id}`, {
        method: "DELETE",
        headers: { "x-user-id": token }
      });
      if (!res.ok) throw new Error("Failed to cancel showtime");
      alert("Showtime deleted");
      loadAllData(token);
    } catch (e: any) {
      alert(e.message);
    }
  };

  // Booking Actions
  const handleCancelBooking = async (id: string) => {
    if (!confirm("Are you sure you want to cancel this booking and free the seats?")) return;
    try {
      const res = await fetch(`${API_URL}/api/bookings/${id}`, {
        method: "DELETE",
        headers: { "x-user-id": token }
      });
      if (!res.ok) throw new Error("Failed to cancel booking");
      alert("Booking cancelled. Seats have been freed.");
      loadAllData(token);
    } catch (e: any) {
      alert(e.message);
    }
  };

  // Calculate stats values
  const totalRevenue = bookings.reduce((sum, b) => sum + b.totalPrice, 0);

  if (loading) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-[#F7F8FD]">
        <div className="animate-spin rounded-full h-[40px] w-[40px] border-t-2 border-b-2 border-[#4F46E5]" />
        <span className="text-[14px] font-semibold text-zinc-600 mt-[16px] font-inter">Loading Console...</span>
      </div>
    );
  }

  if (!authorized) return null;

  return (
    <div className="relative w-full h-full flex flex-col bg-[#F7F8FD] font-inter">
      {/* Top Header */}
      <div className="h-[56px] border-b border-zinc-200 bg-white px-[16px] flex items-center justify-between shrink-0">
        <h1 className="text-[16px] font-bold text-zinc-950 font-inter">Admin Console</h1>
        <button
          onClick={() => router.push("/")}
          className="px-[12px] py-[6px] bg-zinc-100 hover:bg-zinc-200 text-zinc-700 text-[12px] font-bold rounded cursor-pointer font-inter transition-colors"
        >
          Home
        </button>
      </div>

      {/* Horizontal Tabs: Overview, Movies, Theaters, Schedules, Bookings */}
      <div className="h-[40px] bg-white border-b border-zinc-200 flex overflow-x-auto scrollbar-none shrink-0 px-[8px] gap-[8px]">
        {(["overview", "movies", "theaters", "schedules", "bookings"] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`h-full px-[12px] flex items-center justify-center text-[12px] font-bold border-b-2 shrink-0 capitalize transition-all cursor-pointer ${
              activeTab === tab
                ? "border-[#4F46E5] text-[#4F46E5]"
                : "border-transparent text-zinc-500"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Main Tab Contents area (scrollable) */}
      <div className="flex-1 overflow-y-auto p-[16px] pb-[40px] scrollbar-none">
        
        {/* OVERVIEW PANEL */}
        {activeTab === "overview" && (
          <div className="flex flex-col gap-[16px]">
            <div className="bg-white p-[16px] rounded-[10px] border border-zinc-200 flex flex-col gap-[4px]">
              <span className="text-[12px] text-zinc-400 font-semibold uppercase tracking-wider">Gross Bookings</span>
              <span className="text-[28px] font-bold text-[#4F46E5]">₹{totalRevenue}</span>
            </div>
            
            <div className="grid grid-cols-2 gap-[12px]">
              <div className="bg-white p-[12px] rounded-[10px] border border-zinc-200 flex flex-col">
                <span className="text-[11px] text-zinc-400 font-semibold">Movies</span>
                <span className="text-[20px] font-bold text-zinc-800 mt-[4px]">{movies.length}</span>
              </div>
              <div className="bg-white p-[12px] rounded-[10px] border border-zinc-200 flex flex-col">
                <span className="text-[11px] text-zinc-400 font-semibold">Theaters</span>
                <span className="text-[20px] font-bold text-zinc-800 mt-[4px]">{theaters.length}</span>
              </div>
              <div className="bg-white p-[12px] rounded-[10px] border border-zinc-200 flex flex-col">
                <span className="text-[11px] text-zinc-400 font-semibold">Schedules</span>
                <span className="text-[20px] font-bold text-zinc-800 mt-[4px]">{schedules.length}</span>
              </div>
              <div className="bg-white p-[12px] rounded-[10px] border border-zinc-200 flex flex-col">
                <span className="text-[11px] text-zinc-400 font-semibold">Bookings</span>
                <span className="text-[20px] font-bold text-zinc-800 mt-[4px]">{bookings.length}</span>
              </div>
            </div>
          </div>
        )}

        {/* MOVIES PANEL */}
        {activeTab === "movies" && (
          <div className="flex flex-col gap-[12px]">
            <button
              onClick={() => setShowMovieForm(true)}
              className="w-full h-[40px] bg-[#4F46E5] hover:bg-[#4338ca] text-white text-[13px] font-bold rounded flex items-center justify-center cursor-pointer transition-colors"
            >
              + Add New Movie
            </button>

            <div className="flex flex-col gap-[8px] mt-[4px]">
              {movies.map(movie => (
                <div key={movie._id} className="bg-white p-[12px] rounded-[8px] border border-zinc-200 flex items-center gap-[12px]">
                  <div className="relative w-[48px] h-[64px] bg-zinc-100 rounded overflow-hidden shrink-0">
                    <img src={movie.posterUrl} alt={movie.title} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-[13px] font-bold text-zinc-950 truncate leading-tight">{movie.title}</h3>
                    <p className="text-[11px] text-zinc-500 truncate mt-[3px]">{movie.genre}</p>
                    <span className="inline-block mt-[4px] bg-zinc-100 text-zinc-600 text-[9px] font-bold px-[5px] py-[2px] rounded">
                      {movie.showingType.replace("_", " ")}
                    </span>
                  </div>
                  <div className="flex items-center gap-[6px] shrink-0">
                    <button
                      onClick={() => handleEditMovie(movie)}
                      className="p-[6px] bg-zinc-50 hover:bg-zinc-100 rounded text-zinc-600 border border-zinc-200 cursor-pointer transition-colors flex items-center justify-center"
                      title="Edit Movie"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-[14px] h-[14px]">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleDeleteMovie(movie._id)}
                      className="p-[6px] bg-rose-50 hover:bg-rose-100 rounded text-rose-600 border border-rose-150 cursor-pointer transition-colors flex items-center justify-center"
                      title="Delete Movie"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-[14px] h-[14px]">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* THEATERS PANEL */}
        {activeTab === "theaters" && (
          <div className="flex flex-col gap-[12px]">
            <button
              onClick={() => setShowTheaterForm(true)}
              className="w-full h-[40px] bg-[#4F46E5] hover:bg-[#4338ca] text-white text-[13px] font-bold rounded flex items-center justify-center cursor-pointer transition-colors"
            >
              + Add New Theater
            </button>

            <div className="flex flex-col gap-[8px] mt-[4px]">
              {theaters.map(theater => (
                <div key={theater._id} className="bg-white p-[12px] rounded-[8px] border border-zinc-200 flex items-center gap-[12px]">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-[13px] font-bold text-zinc-950 truncate leading-tight">{theater.name}</h3>
                    <p className="text-[11px] text-zinc-500 truncate mt-[3px]">{theater.location}</p>
                    <div className="flex gap-[4px] mt-[4px] flex-wrap">
                      <span className="text-[9px] bg-zinc-100 px-[4px] py-[2px] rounded font-medium text-zinc-500">
                        {theater.rows.length} rows ({theater.colsCount} cols)
                      </span>
                      <span className="text-[9px] bg-zinc-100 px-[4px] py-[2px] rounded font-medium text-zinc-500">
                        Price: {theater.rateRange}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-[6px] shrink-0">
                    <button
                      onClick={() => handleEditTheater(theater)}
                      className="p-[6px] bg-zinc-50 hover:bg-zinc-100 rounded text-zinc-600 border border-zinc-200 cursor-pointer transition-colors flex items-center justify-center"
                      title="Edit Theater"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-[14px] h-[14px]">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleDeleteTheater(theater._id)}
                      className="p-[6px] bg-rose-50 hover:bg-rose-100 rounded text-rose-600 border border-rose-150 cursor-pointer transition-colors flex items-center justify-center"
                      title="Delete Theater"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-[14px] h-[14px]">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SCHEDULES PANEL */}
        {activeTab === "schedules" && (
          <div className="flex flex-col gap-[12px]">
            <button
              onClick={() => setShowScheduleForm(true)}
              className="w-full h-[40px] bg-[#4F46E5] hover:bg-[#4338ca] text-white text-[13px] font-bold rounded flex items-center justify-center cursor-pointer transition-colors"
            >
              + Schedule Movie Slot
            </button>

            <div className="flex flex-col gap-[8px] mt-[4px]">
              {schedules.map(slot => (
                <div key={slot._id} className="bg-white p-[12px] rounded-[8px] border border-zinc-200 flex flex-col gap-[6px]">
                  <div className="flex justify-between items-start">
                    <div className="min-w-0">
                      <h3 className="text-[13px] font-bold text-zinc-950 truncate leading-none">
                        {slot.movieId?.title || "Unknown Movie"}
                      </h3>
                      <p className="text-[11px] text-zinc-500 truncate mt-[4px]">
                        {slot.theaterId?.name || "Unknown Theater"}
                      </p>
                    </div>
                    <button
                      onClick={() => handleDeleteSchedule(slot._id)}
                      className="p-[5px] bg-rose-50 hover:bg-rose-100 rounded text-rose-600 text-[10px] font-bold cursor-pointer transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                  
                  <div className="flex justify-between items-center text-[10px] text-zinc-500 font-semibold border-t border-zinc-100 pt-[6px]">
                    <span>{slot.date} @ {slot.time}</span>
                    <span className="bg-[#4F46E5]/10 text-[#4F46E5] px-[5px] py-[2px] rounded font-bold">
                      {slot.format} - ₹{slot.price}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* BOOKINGS PANEL */}
        {activeTab === "bookings" && (
          <div className="flex flex-col gap-[8px]">
            {bookings.map(b => (
              <div key={b._id} className="bg-white p-[12px] rounded-[8px] border border-zinc-200 flex flex-col gap-[6px]">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-[13px] font-bold text-zinc-950 leading-none">
                      {b.movieId?.title || "Movie Booked"}
                    </h3>
                    <p className="text-[11px] text-zinc-500 mt-[4px]">
                      {b.theaterId?.name || "Theater location"}
                    </p>
                  </div>
                  <button
                    onClick={() => handleCancelBooking(b._id)}
                    className="px-[6px] py-[4px] bg-rose-50 hover:bg-rose-100 text-rose-600 text-[10px] font-bold rounded cursor-pointer transition-colors"
                  >
                    Cancel Ticket
                  </button>
                </div>

                <div className="flex justify-between items-center text-[10px] text-zinc-400 border-t border-zinc-100 pt-[6px]">
                  <span>Customer: {b.userId?.name || "Anonymous"}</span>
                  <span className="font-bold text-zinc-700">₹{b.totalPrice}</span>
                </div>
                <div className="text-[10px] text-zinc-500 flex justify-between">
                  <span>Seats: {b.seats.join(", ")}</span>
                  <span>Date: {b.showtimeId?.date} @ {b.showtimeId?.time}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* OVERLAY FOR ADD MOVIE */}
      {showMovieForm && (
        <div className="absolute inset-0 bg-black/50 z-40 flex flex-col justify-end">
          <form onSubmit={handleCreateMovie} className="bg-white rounded-t-[16px] max-h-[90%] overflow-y-auto p-[16px] flex flex-col gap-[12px] scrollbar-none">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-[8px]">
              <h2 className="text-[15px] font-bold text-zinc-900">{editingMovieId ? "Edit Movie" : "Add New Movie"}</h2>
              <button type="button" onClick={handleCloseMovieForm} className="text-[13px] text-zinc-400 font-semibold cursor-pointer">Close</button>
            </div>

            <div className="flex flex-col gap-[4px]">
              <label className="text-[11px] font-semibold text-zinc-500">Title</label>
              <input
                type="text"
                required
                value={movieForm.title}
                onChange={e => setMovieForm(prev => ({ ...prev, title: e.target.value }))}
                className="h-[36px] bg-zinc-50 border border-zinc-200 rounded px-[10px] text-[13px] outline-none focus:border-[#4F46E5]"
              />
            </div>

            <div className="flex flex-col gap-[4px]">
              <label className="text-[11px] font-semibold text-zinc-500">Genre</label>
              <input
                type="text"
                required
                placeholder="Action, Thriller"
                value={movieForm.genre}
                onChange={e => setMovieForm(prev => ({ ...prev, genre: e.target.value }))}
                className="h-[36px] bg-zinc-50 border border-zinc-200 rounded px-[10px] text-[13px] outline-none focus:border-[#4F46E5]"
              />
            </div>

            <div className="grid grid-cols-2 gap-[12px]">
              <div className="flex flex-col gap-[4px]">
                <label className="text-[11px] font-semibold text-zinc-500">Rating (1-5)</label>
                <input
                  type="number"
                  min={1}
                  max={5}
                  step={0.1}
                  required
                  value={movieForm.rating}
                  onChange={e => setMovieForm(prev => ({ ...prev, rating: parseFloat(e.target.value) }))}
                  className="h-[36px] bg-zinc-50 border border-zinc-200 rounded px-[10px] text-[13px] outline-none focus:border-[#4F46E5]"
                />
              </div>
              <div className="flex flex-col gap-[4px]">
                <label className="text-[11px] font-semibold text-zinc-500">PG Rating</label>
                <input
                  type="text"
                  value={movieForm.pgRating}
                  onChange={e => setMovieForm(prev => ({ ...prev, pgRating: e.target.value }))}
                  className="h-[36px] bg-zinc-50 border border-zinc-200 rounded px-[10px] text-[13px] outline-none focus:border-[#4F46E5]"
                />
              </div>
            </div>

            <div className="flex flex-col gap-[4px]">
              <label className="text-[11px] font-semibold text-zinc-500">Description</label>
              <textarea
                value={movieForm.description}
                onChange={e => setMovieForm(prev => ({ ...prev, description: e.target.value }))}
                className="h-[60px] bg-zinc-50 border border-zinc-200 rounded p-[8px] text-[13px] outline-none resize-none focus:border-[#4F46E5]"
              />
            </div>

            <div className="flex flex-col gap-[4px]">
              <label className="text-[11px] font-semibold text-zinc-500">Formats (comma separated)</label>
              <input
                type="text"
                required
                value={movieForm.formats}
                onChange={e => setMovieForm(prev => ({ ...prev, formats: e.target.value }))}
                className="h-[36px] bg-zinc-50 border border-zinc-200 rounded px-[10px] text-[13px]"
              />
            </div>

            <div className="grid grid-cols-2 gap-[12px]">
              <div className="flex flex-col gap-[4px]">
                <label className="text-[11px] font-semibold text-zinc-500">Release Date</label>
                <input
                  type="date"
                  required
                  value={movieForm.releaseDate}
                  onChange={e => setMovieForm(prev => ({ ...prev, releaseDate: e.target.value }))}
                  className="h-[36px] bg-zinc-50 border border-zinc-200 rounded px-[10px] text-[13px]"
                />
              </div>
              <div className="flex flex-col gap-[4px]">
                <label className="text-[11px] font-semibold text-zinc-500">Showing Status</label>
                <select
                  value={movieForm.showingType}
                  onChange={e => setMovieForm(prev => ({ ...prev, showingType: e.target.value }))}
                  className="h-[36px] bg-zinc-50 border border-zinc-200 rounded px-[6px] text-[13px]"
                >
                  <option value="now_showing">Now Showing</option>
                  <option value="coming_soon">Coming Soon</option>
                </select>
              </div>
            </div>

            <div className="flex flex-col gap-[4px]">
              <label className="text-[11px] font-semibold text-zinc-500">Poster URL / Link</label>
              <input
                type="text"
                required
                value={movieForm.posterUrl}
                onChange={e => setMovieForm(prev => ({ ...prev, posterUrl: e.target.value }))}
                className="h-[36px] bg-zinc-50 border border-zinc-200 rounded px-[10px] text-[13px]"
              />
            </div>

            {/* Sub-form cast members list */}
            <div className="border border-zinc-150 p-[10px] rounded bg-zinc-50">
              <h3 className="text-[11px] font-bold text-zinc-700 mb-[6px]">Dynamic Cast list ({movieForm.cast.length})</h3>
              
              {movieForm.cast.length > 0 && (
                <div className="flex flex-col gap-[6px] mb-[10px] max-h-[120px] overflow-y-auto border-b border-zinc-200 pb-[8px] scrollbar-none">
                  {movieForm.cast.map((c, i) => (
                    <div key={i} className="flex items-center justify-between text-[11px] bg-white p-[6px] border border-zinc-150 rounded">
                      <div className="flex items-center gap-[6px] min-w-0">
                        <img src={c.image} alt={c.name} className="w-[24px] h-[24px] rounded-full object-cover shrink-0" />
                        <div className="truncate">
                          <span className="font-bold text-zinc-800">{c.name}</span>
                          <span className="text-zinc-500"> as {c.character}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-[8px]">
                        <button
                          type="button"
                          onClick={() => handleEditCast(i)}
                          className="text-indigo-600 hover:text-indigo-800 font-bold cursor-pointer"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if (editingCastIndex === i) {
                              setEditingCastIndex(null);
                              setCastName("");
                              setCastChar("");
                              setCastImg("/assets/home/Hero Image.png");
                            }
                            setMovieForm(prev => ({
                              ...prev,
                              cast: prev.cast.filter((_, idx) => idx !== i)
                            }));
                          }}
                          className="text-rose-500 hover:text-rose-700 font-bold cursor-pointer"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex flex-col gap-[8px]">
                <input
                  type="text"
                  placeholder="Actor Name"
                  value={castName}
                  onChange={e => setCastName(e.target.value)}
                  className="h-[30px] border border-zinc-200 rounded px-[8px] text-[12px] bg-white outline-none"
                />
                <input
                  type="text"
                  placeholder="Character Name"
                  value={castChar}
                  onChange={e => setCastChar(e.target.value)}
                  className="h-[30px] border border-zinc-200 rounded px-[8px] text-[12px] bg-white outline-none"
                />
                <input
                  type="text"
                  placeholder="Cast Photo URL"
                  value={castImg}
                  onChange={e => setCastImg(e.target.value)}
                  className="h-[30px] border border-zinc-200 rounded px-[8px] text-[12px] bg-white outline-none"
                />
                <button
                  type="button"
                  onClick={handleAddCast}
                  className="h-[30px] bg-zinc-800 text-white rounded text-[11px] font-bold cursor-pointer"
                >
                  {editingCastIndex !== null ? "✓ Update Cast Member" : "+ Add Cast Member"}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="h-[40px] bg-[#4F46E5] text-white text-[13px] font-bold rounded cursor-pointer transition-colors mt-[8px]"
            >
              {editingMovieId ? "Update Movie" : "Save Movie record"}
            </button>
          </form>
        </div>
      )}

      {/* OVERLAY FOR ADD THEATER */}
      {showTheaterForm && (
        <div className="absolute inset-0 bg-black/50 z-40 flex flex-col justify-end">
          <form onSubmit={handleCreateTheater} className="bg-white rounded-t-[16px] max-h-[90%] overflow-y-auto p-[16px] flex flex-col gap-[12px] scrollbar-none">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-[8px]">
              <h2 className="text-[15px] font-bold text-zinc-900">{editingTheaterId ? "Edit Theater" : "Add New Theater"}</h2>
              <button type="button" onClick={handleCloseTheaterForm} className="text-[13px] text-zinc-400 font-semibold cursor-pointer">Close</button>
            </div>

            <div className="flex flex-col gap-[4px]">
              <label className="text-[11px] font-semibold text-zinc-500">Theater Name</label>
              <input
                type="text"
                required
                placeholder="The Grandview"
                value={theaterForm.name}
                onChange={e => setTheaterForm(prev => ({ ...prev, name: e.target.value }))}
                className="h-[36px] bg-zinc-50 border border-zinc-200 rounded px-[10px] text-[13px] outline-none"
              />
            </div>

            <div className="flex flex-col gap-[4px]">
              <label className="text-[11px] font-semibold text-zinc-500">Location</label>
              <input
                type="text"
                required
                placeholder="Aurora Boulevard, Santa Mesa"
                value={theaterForm.location}
                onChange={e => setTheaterForm(prev => ({ ...prev, location: e.target.value }))}
                className="h-[36px] bg-zinc-50 border border-zinc-200 rounded px-[10px] text-[13px] outline-none"
              />
            </div>

            <div className="flex flex-col gap-[4px]">
              <label className="text-[11px] font-semibold text-zinc-500">Rate Range Reference</label>
              <input
                type="text"
                required
                value={theaterForm.rateRange}
                onChange={e => setTheaterForm(prev => ({ ...prev, rateRange: e.target.value }))}
                className="h-[36px] bg-zinc-50 border border-zinc-200 rounded px-[10px] text-[13px] outline-none"
              />
            </div>

            <div className="flex flex-col gap-[4px]">
              <label className="text-[11px] font-semibold text-zinc-500">Logo Image Link</label>
              <input
                type="text"
                required
                value={theaterForm.imageUrl}
                onChange={e => setTheaterForm(prev => ({ ...prev, imageUrl: e.target.value }))}
                className="h-[36px] bg-zinc-50 border border-zinc-200 rounded px-[10px] text-[13px]"
              />
            </div>

            {/* Customizable seating configuration fields */}
            <div className="border border-zinc-150 p-[10px] rounded bg-zinc-50 flex flex-col gap-[10px]">
              <h3 className="text-[11px] font-bold text-zinc-700">Custom Seating Settings</h3>
              
              <div className="flex flex-col gap-[4px]">
                <label className="text-[10px] font-medium text-zinc-500">Row Letters (comma separated)</label>
                <input
                  type="text"
                  required
                  value={theaterForm.rows}
                  onChange={e => setTheaterForm(prev => ({ ...prev, rows: e.target.value }))}
                  className="h-[32px] border border-zinc-200 rounded px-[8px] text-[12px] bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-[8px]">
                <div className="flex flex-col gap-[4px]">
                  <label className="text-[10px] font-medium text-zinc-500">Cols Count (e.g. 30)</label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={theaterForm.colsCount}
                    onChange={e => setTheaterForm(prev => ({ ...prev, colsCount: parseInt(e.target.value, 10) }))}
                    className="h-[32px] border border-zinc-200 rounded px-[8px] text-[12px] bg-white"
                  />
                </div>

                <div className="flex flex-col gap-[4px]">
                  <label className="text-[10px] font-medium text-zinc-500">Row Aisles (letters)</label>
                  <input
                    type="text"
                    value={theaterForm.horizontalAisles}
                    onChange={e => setTheaterForm(prev => ({ ...prev, horizontalAisles: e.target.value }))}
                    className="h-[32px] border border-zinc-200 rounded px-[8px] text-[12px] bg-white"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-[4px]">
                <label className="text-[10px] font-medium text-zinc-500">Col Aisles (cols after which gap falls)</label>
                <input
                  type="text"
                  placeholder="e.g. 10, 20"
                  value={theaterForm.verticalAisles}
                  onChange={e => setTheaterForm(prev => ({ ...prev, verticalAisles: e.target.value }))}
                  className="h-[32px] border border-zinc-200 rounded px-[8px] text-[12px] bg-white"
                />
              </div>
            </div>

            <button
              type="submit"
              className="h-[40px] bg-[#4F46E5] text-white text-[13px] font-bold rounded cursor-pointer transition-colors mt-[8px]"
            >
              {editingTheaterId ? "Update Theater" : "Save Theater record"}
            </button>
          </form>
        </div>
      )}

      {/* OVERLAY FOR ADD SCHEDULE */}
      {showScheduleForm && (
        <div className="absolute inset-0 bg-black/50 z-40 flex flex-col justify-end">
          <form onSubmit={handleCreateSchedule} className="bg-white rounded-t-[16px] max-h-[90%] overflow-y-auto p-[16px] flex flex-col gap-[12px] scrollbar-none">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-[8px]">
              <h2 className="text-[15px] font-bold text-zinc-900">Schedule Showtime Slot</h2>
              <button type="button" onClick={() => setShowScheduleForm(false)} className="text-[13px] text-zinc-400 font-semibold cursor-pointer">Close</button>
            </div>

            <div className="flex flex-col gap-[4px]">
              <label className="text-[11px] font-semibold text-zinc-500">Select Movie</label>
              <select
                required
                value={scheduleForm.movieId}
                onChange={e => setScheduleForm(prev => ({ ...prev, movieId: e.target.value }))}
                className="h-[36px] bg-zinc-50 border border-zinc-200 rounded px-[6px] text-[13px]"
              >
                <option value="">-- Choose Movie --</option>
                {movies.filter(m => m.showingType === "now_showing").map(m => (
                  <option key={m._id} value={m._id}>{m.title}</option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-[4px]">
              <label className="text-[11px] font-semibold text-zinc-500">Select Theater</label>
              <select
                required
                value={scheduleForm.theaterId}
                onChange={e => setScheduleForm(prev => ({ ...prev, theaterId: e.target.value }))}
                className="h-[36px] bg-zinc-50 border border-zinc-200 rounded px-[6px] text-[13px]"
              >
                <option value="">-- Choose Theater --</option>
                {theaters.map(t => (
                  <option key={t._id} value={t._id}>{t.name}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-[12px]">
              <div className="flex flex-col gap-[4px]">
                <label className="text-[11px] font-semibold text-zinc-500">Show Date</label>
                <input
                  type="date"
                  required
                  value={scheduleForm.date}
                  onChange={e => setScheduleForm(prev => ({ ...prev, date: e.target.value }))}
                  className="h-[36px] bg-zinc-50 border border-zinc-200 rounded px-[10px] text-[13px]"
                />
              </div>
              <div className="flex flex-col gap-[4px]">
                <label className="text-[11px] font-semibold text-zinc-500">Show Time</label>
                <select
                  value={scheduleForm.time}
                  onChange={e => setScheduleForm(prev => ({ ...prev, time: e.target.value }))}
                  className="h-[36px] bg-zinc-50 border border-zinc-200 rounded px-[6px] text-[13px]"
                >
                  <option value="10:00 AM">10:00 AM</option>
                  <option value="12:00 PM">12:00 PM</option>
                  <option value="2:00 PM">2:00 PM</option>
                  <option value="4:00 PM">4:00 PM</option>
                  <option value="6:00 PM">6:00 PM</option>
                  <option value="8:00 PM">8:00 PM</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-[8px]">
              <div className="flex flex-col gap-[4px]">
                <label className="text-[10px] font-semibold text-zinc-500">Format</label>
                <select
                  value={scheduleForm.format}
                  onChange={e => setScheduleForm(prev => ({ ...prev, format: e.target.value }))}
                  className="h-[36px] bg-zinc-50 border border-zinc-200 rounded px-[4px] text-[12px]"
                >
                  <option value="2D">2D</option>
                  <option value="3D">3D</option>
                </select>
              </div>

              <div className="flex flex-col gap-[4px]">
                <label className="text-[10px] font-semibold text-zinc-500">Ticket Price</label>
                <input
                  type="number"
                  required
                  min={1}
                  value={scheduleForm.price}
                  onChange={e => setScheduleForm(prev => ({ ...prev, price: parseInt(e.target.value, 10) }))}
                  className="h-[36px] bg-zinc-50 border border-zinc-200 rounded px-[8px] text-[12px]"
                />
              </div>

              <div className="flex flex-col gap-[4px]">
                <label className="text-[10px] font-semibold text-zinc-500">Screen #</label>
                <input
                  type="number"
                  required
                  min={1}
                  value={scheduleForm.screenNumber}
                  onChange={e => setScheduleForm(prev => ({ ...prev, screenNumber: parseInt(e.target.value, 10) }))}
                  className="h-[36px] bg-zinc-50 border border-zinc-200 rounded px-[8px] text-[12px]"
                />
              </div>
            </div>

            <button
              type="submit"
              className="h-[40px] bg-[#4F46E5] text-white text-[13px] font-bold rounded cursor-pointer transition-colors mt-[8px]"
            >
              Add Showtime Slot
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
