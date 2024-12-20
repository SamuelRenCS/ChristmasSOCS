const dotenv = require("dotenv");
const path = require("path");

// Load environment-specific .env file
const envFile =
  process.env.NODE_ENV === "production"
    ? ".env.production"
    : ".env.development";
dotenv.config({ path: path.resolve(process.cwd(), envFile) });

const config = {
  port: process.env.PORT || 5000,
  secretKey: process.env.SECRET_KEY,
  mongoUrl:
    process.env.MONGODB__URL || "mongodb://localhost:27017/ChristmasSOCS",
  allowedOrigins: process.env.ALLOWED_ORIGINS || ["http://localhost:5173"],
};

console.log("Config:", config);

// validate required environment variables
const requiredEnvVars = ["SECRET_KEY"];
const missingEnvVars = requiredEnvVars.filter((envVar) => !process.env[envVar]);

if (missingEnvVars.length > 0) {
  throw new Error(
    `Missing required environment variables: ${missingEnvVars.join(", ")}`
  );
}

module.exports = config;
