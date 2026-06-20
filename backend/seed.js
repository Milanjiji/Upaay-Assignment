require("dotenv").config();
const dns = require("dns");
try {
  dns.setServers(["8.8.8.8", "8.8.4.4"]);
} catch (e) {
  console.warn("Could not set custom DNS servers, using default:", e.message);
}
const mongoose = require("mongoose");
const Movie = require("./models/Movie");
const Theater = require("./models/Theater");
const Showtime = require("./models/Showtime");
const User = require("./models/User");
const bcrypt = require("bcryptjs");

const nowShowingMovies = [
  {
    title: "Meg 2: The Trench",
    genre: "Action, Sci-fi, Horror",
    rating: 4.5,
    pgRating: "PG-13",
    description: "A research team encounters multiple threats while exploring the depths of the ocean, including a malevolent mining operation.",
    formats: ["2D", "3D"],
    releaseDate: new Date("2026-06-10"),
    showingType: "now_showing",
    posterUrl: "/assets/home/Hero Image.png",
    cast: [
      { name: "Jason Statham", character: "Jonas Taylor", image: "/assets/home/Hero Image.png" },
      { name: "Jing Wu", character: "Jiuming Zhang", image: "/assets/home/Hero Image.png" },
      { name: "Shuya Sophia", character: "Meiying", image: "/assets/home/Hero Image.png" }
    ]
  },
  {
    title: "The Nun II",
    genre: "Horror",
    rating: 4.5,
    pgRating: "R",
    description: "1956 - France. A priest is murdered. An evil is spreading. The sequel to the worldwide smash hit follows Sister Irene as she once again comes face-to-face with Valak, the demon nun.",
    formats: ["2D"],
    releaseDate: new Date("2026-06-15"),
    showingType: "now_showing",
    posterUrl: "/assets/home/Hero Image.png",
    cast: [
      { name: "Taissa Farmiga", character: "Sister Irene", image: "/assets/home/Hero Image.png" },
      { name: "Jonas Bloquet", character: "Maurice", image: "/assets/home/Hero Image.png" },
      { name: "Storm Reid", character: "Sister Debra", image: "/assets/home/Hero Image.png" }
    ]
  },
  {
    title: "Fast X",
    genre: "Action, Adventure",
    rating: 4.5,
    pgRating: "PG-13",
    description: "Dom Toretto and his family are targeted by the vengeful son of drug kingpin Hernan Reyes.",
    formats: ["2D", "3D"],
    releaseDate: new Date("2026-05-19"),
    showingType: "now_showing",
    posterUrl: "/assets/home/Hero Image.png",
    cast: [
      { name: "Vin Diesel", character: "Dom Toretto", image: "/assets/home/Hero Image.png" },
      { name: "Michelle Rodriguez", character: "Letty Ortiz", image: "/assets/home/Hero Image.png" },
      { name: "Jason Momoa", character: "Dante Reyes", image: "/assets/home/Hero Image.png" }
    ]
  },
  {
    title: "John Wick: Chapter 4",
    genre: "Action, Thriller",
    rating: 4.8,
    pgRating: "R",
    description: "John Wick uncovers a path to defeating The High Table. But before he can earn his freedom, Wick must face a new enemy with powerful alliances across the globe.",
    formats: ["2D", "3D"],
    releaseDate: new Date("2026-03-24"),
    showingType: "now_showing",
    posterUrl: "/assets/home/Hero Image.png",
    cast: [
      { name: "Keanu Reeves", character: "John Wick", image: "/assets/home/Hero Image.png" },
      { name: "Donnie Yen", character: "Caine", image: "/assets/home/Hero Image.png" },
      { name: "Bill Skarsgard", character: "Marquis", image: "/assets/home/Hero Image.png" }
    ]
  }
];

const comingSoonMovies = [
  {
    title: "Dune: Part Two",
    genre: "Adventure, Sci-Fi",
    rating: 4.9,
    pgRating: "PG-13",
    description: "Paul Atreides unites with Chani and the Fremen while seeking revenge against the conspirators who destroyed his family.",
    formats: ["2D", "3D"],
    releaseDate: new Date("2026-09-01"),
    showingType: "coming_soon",
    posterUrl: "/assets/home/Hero Image.png",
    cast: [
      { name: "Timothee Chalamet", character: "Paul Atreides", image: "/assets/home/Hero Image.png" },
      { name: "Zendaya", character: "Chani", image: "/assets/home/Hero Image.png" }
    ]
  },
  {
    title: "Oppenheimer",
    genre: "Drama, History",
    rating: 4.8,
    pgRating: "R",
    description: "The story of American scientist J. Robert Oppenheimer and his role in the development of the atomic bomb.",
    formats: ["2D"],
    releaseDate: new Date("2026-08-15"),
    showingType: "coming_soon",
    posterUrl: "/assets/home/Hero Image.png",
    cast: [
      { name: "Cillian Murphy", character: "J. Robert Oppenheimer", image: "/assets/home/Hero Image.png" },
      { name: "Emily Blunt", character: "Kitty Oppenheimer", image: "/assets/home/Hero Image.png" }
    ]
  }
];

const theatersData = [
  {
    name: "The Grandview",
    location: "Camp Aguinaldo, Quezon City",
    rateRange: "₹320 - ₹450",
    rows: ["A", "B", "C", "D", "E", "F", "G", "H", "J", "K", "L", "M"],
    colsCount: 30,
    verticalAisles: [10, 20],
    horizontalAisles: ["J"]
  },
  {
    name: "Play Loft",
    location: "Aurora Boulevard, Santa Mesa",
    rateRange: "₹300 - ₹430",
    rows: ["A", "B", "C", "D", "E", "F", "G", "H", "J", "K", "L", "M"],
    colsCount: 30,
    verticalAisles: [10, 20],
    horizontalAisles: ["J"]
  },
  {
    name: "CinemaOne",
    location: "A. Cruz, Pasay City",
    rateRange: "₹280 - ₹400",
    rows: ["A", "B", "C", "D", "E", "F", "G", "H", "J", "K", "L", "M"],
    colsCount: 30,
    verticalAisles: [10, 20],
    horizontalAisles: ["J"]
  },
  {
    name: "Cinemount",
    location: "Baclaran, Paranaque City",
    rateRange: "₹320 - ₹380",
    rows: ["A", "B", "C", "D", "E", "F", "G", "H", "J", "K", "L", "M"],
    colsCount: 30,
    verticalAisles: [10, 20],
    horizontalAisles: ["J"]
  }
];

const seedDB = async () => {
  try {
    console.log("Connecting to MongoDB for seeding...");
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected successfully!");

    // Clean existing data
    console.log("Clearing existing collections...");
    await Movie.deleteMany({});
    await Theater.deleteMany({});
    await Showtime.deleteMany({});
    
    // Seed admin user if it doesn't exist
    const adminEmail = "admin@upaay.creative";
    const existingAdmin = await User.findOne({ email: adminEmail });
    if (!existingAdmin) {
      console.log("Creating default administrator account...");
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash("admin123", salt);
      const admin = new User({
        name: "Admin User",
        email: adminEmail,
        password: hashedPassword,
        authProvider: "credentials",
        role: "admin"
      });
      await admin.save();
      console.log(`Admin account created! Email: ${adminEmail}, Password: admin123`);
    }

    // Insert Movies
    console.log("Seeding Movies...");
    const movies = await Movie.insertMany([...nowShowingMovies, ...comingSoonMovies]);
    console.log(`Seeded ${movies.length} movies.`);

    // Insert Theaters
    console.log("Seeding Theaters...");
    const theaters = await Theater.insertMany(theatersData);
    console.log(`Seeded ${theaters.length} theaters.`);

    // Seed Showtimes for the next 7 days for Now Showing movies
    console.log("Seeding Showtimes...");
    const showingMovies = movies.filter(m => m.showingType === "now_showing");
    const dates = [];
    const today = new Date();
    for (let i = 0; i < 7; i++) {
      const nextDay = new Date(today);
      nextDay.setDate(today.getDate() + i);
      dates.push(nextDay.toISOString().split("T")[0]);
    }

    const timeSlots = ["10:00 AM", "2:00 PM", "6:00 PM"];
    const formatsList = ["2D", "3D"];
    let showtimeCount = 0;

    for (const theater of theaters) {
      for (const movie of showingMovies) {
        for (const date of dates) {
          for (let index = 0; index < timeSlots.length; index++) {
            const time = timeSlots[index];
            const format = formatsList[index % formatsList.length];
            
            const showtime = new Showtime({
              movieId: movie._id,
              theaterId: theater._id,
              date,
              time,
              format,
              price: 280 + (index * 40), // ₹280, ₹320, ₹360
              screenNumber: showingMovies.indexOf(movie) + 1
            });
            
            // Occupy some random seats to match mockup state (e.g. H-7, H-8, H-9, H-10, J-11, J-12)
            // Pre-save middleware generates standard seats, we can modify them here
            const seatsList = [];
            for (const row of theater.rows) {
              for (let col = 1; col <= theater.colsCount; col++) {
                const seatNumber = `${row}-${col}`;
                const isOccupied = ["H-7", "H-8", "H-9", "H-10", "J-11", "J-12"].includes(seatNumber);
                seatsList.push({
                  seatNumber,
                  status: isOccupied ? "occupied" : "available",
                  userId: null
                });
              }
            }
            showtime.seats = seatsList;

            await showtime.save();
            showtimeCount++;
          }
        }
      }
    }

    console.log(`Successfully seeded ${showtimeCount} showtime slots!`);
    console.log("Database seeding completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("Seeding database failed:", error);
    process.exit(1);
  }
};

seedDB();
