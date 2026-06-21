const request = require("supertest");

// Mock authentication so we don't need a real JWT token
jest.mock("../middleware/auth", () => ({
  verifyUser: (req, res, next) => {
    req.user = { _id: "665089dfc97235a8bc76faaa" };
    next();
  },
  verifyAdmin: (req, res, next) => next()
}));

const app = require("../server");
const mongoose = require("mongoose");
const { redis } = require("../config/redis");
const Showtime = require("../models/Showtime");
const Booking = require("../models/Booking");

jest.setTimeout(30000);

describe("Concurrency Control - Redis Distributed Lock", () => {
  beforeAll(async () => {
    // Wait for Mongoose to connect before running tests
    while (mongoose.connection.readyState !== 1) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }, 30000);

  afterAll(async () => {
    // Close connections to gracefully exit Jest
    await mongoose.connection.close();
    await redis.quit();
  });

  it("should prevent double booking when two requests are made simultaneously", async () => {
    // Fetch a real showtime from the database to run a realistic booking test
    const realShowtime = await Showtime.findOne();
    if (!realShowtime) {
      throw new Error("No showtimes found in the database. Please run seed.js or ensure database is seeded.");
    }

    // Find two available seats
    const availableSeats = realShowtime.seats
      .filter(s => s.status === "available")
      .map(s => s.seatNumber);

    if (availableSeats.length < 2) {
      throw new Error(`Not enough available seats in showtime ${realShowtime._id} to run the concurrency test.`);
    }

    const testSeats = [availableSeats[0], availableSeats[1]];

    const bookingPayload = {
      movieId: realShowtime.movieId.toString(),
      theaterId: realShowtime.theaterId.toString(),
      showtimeId: realShowtime._id.toString(),
      seats: testSeats,
      totalPrice: 400,
      paymentMethod: "card",
      cardDetails: { nameOnCard: "Test User", cardNumber: "1234567812345678" }
    };

    console.log(`\n[Test] Dispatching 2 concurrent POST /api/bookings requests for showtime: ${realShowtime._id} (Seats: ${testSeats.join(", ")})`);

    // Fire two identical POST requests exactly at the same time using Promise.all
    const [response1, response2] = await Promise.all([
      request(app).post("/api/bookings").send(bookingPayload),
      request(app).post("/api/bookings").send(bookingPayload)
    ]);

    console.log(`[Test] Request 1 Response - Status: ${response1.status}, Body:`, response1.body);
    console.log(`[Test] Request 2 Response - Status: ${response2.status}, Body:`, response2.body);

    const statuses = [response1.status, response2.status];
    
    // Assert that exactly one request succeeded with 201 Created, and the other failed with 409 Conflict
    expect(statuses).toContain(201);
    expect(statuses).toContain(409);
    
    const conflictResponse = response1.status === 409 ? response1 : response2;
    expect(conflictResponse.body.message).toMatch(/High traffic: Someone else is currently booking tickets for this show/i);
    
    const successResponse = response1.status === 201 ? response1 : response2;
    expect(successResponse.body.message).toMatch(/Booking placed successfully/i);

    // Clean up: delete the booking record and revert the seats status to available
    const createdBooking = successResponse.body.booking;
    if (createdBooking && createdBooking._id) {
      console.log(`[Test] Cleaning up booking record ${createdBooking._id} and resetting seats...`);
      await Booking.findByIdAndDelete(createdBooking._id);
      await Showtime.updateOne(
        { _id: realShowtime._id },
        { 
          $set: { 
            "seats.$[elem].status": "available", 
            "seats.$[elem].userId": null 
          } 
        },
        { 
          arrayFilters: [{ "elem.seatNumber": { $in: testSeats } }] 
        }
      );
      console.log("[Test] Database successfully restored to original state.");
    }
  });
});
