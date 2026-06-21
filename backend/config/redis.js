const Redis = require("ioredis");
const Redlock = require("redlock").default;

const isUpstash = process.env.REDIS_URL && process.env.REDIS_URL.includes("upstash.io");
const redisOptions = {
  family: 4, // Force IPv4 to prevent ECONNRESET on some Node environments
};

if (isUpstash && !process.env.REDIS_URL.startsWith("rediss://")) {
  redisOptions.tls = { rejectUnauthorized: false };
}

const redis = new Redis(process.env.REDIS_URL, redisOptions);

// Configure redlock with our single redis instance
const redlock = new Redlock(
  [redis],
  {
    driftFactor: 0.01, // time in ms
    retryCount: 0, // We want to fail immediately if locked to respond with 409
    retryDelay: 200, // time in ms
    retryJitter: 200, // time in ms
  }
);

redlock.on("clientError", function (err) {
  console.error("A redis error has occurred:", err);
});

module.exports = { redis, redlock };
