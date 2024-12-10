const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const cors = require("cors");

// models
const User = require("./models/user");

const SECRET_KEY = "ChristmasSOCS";

// helper functions (MOVE TO SEPARATE FILE LATER)
function checkIsMcGillMember(email) {
  // check if email is @mcgill.ca or @mail.mcgill.ca
  return email.endsWith("@mcgill.ca") || email.endsWith("@mail.mcgill.ca");
}

// connect to MongoDB
const dbUrl = "mongodb://localhost:27017/ChristmasSOCS";
mongoose.connect(dbUrl);

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
  console.log("Connected to MongoDB");
});

const app = express();

// middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// enable CORS
app.use(
  cors({
    origin: "http://localhost:5173", // allow requests from the React app
    methods: ["GET", "POST", "PUT", "DELETE"], // allowed methods
    credentials: true,
  })
);

// generate JWT
function generateToken(user) {
  return jwt.sign();
}

// middleware to authenticate JWT
function authenticateJWT(req, res, next) {
  const token = req.header.authorizatio?.split(" ")[1]; // Bearer <token>
  if (!token) return res.status(401).json({ message: "Token missing" });

  jwt.verify(token, SECRET_KEY, (err, user) => {
    if (err) return res.status(403).json({ message: "Invalid token" });

    req.user = user;
    next();
  });
}

// login route
app.post("/login", (req, res) => {
  const { username, password } = req.body;
  // find user in database

  const token = generateToken(user);
  res.status(200).json({ token });
});

// Serve static files from the React (Vite) app
app.use(express.static(path.join(__dirname, "../client/dist")));

// TODO: Move the api routes to separate file

// Serve the login api route
app.post("/api/login", async (req, res) => {
  console.log(req.body);
  const { email, password } = req.body;

  try {
    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Generate JWT
    const token = jwt.sign(
      {
        id: user._id,
        email: user.email,
      },
      SECRET_KEY,
      { expiresIn: "1h" }
    );

    res.status(200).json({
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Login failed", error: error.message });
  }
});

// Serve the register api route
app.post("/api/register", async (req, res) => {
  console.log(req.body);
  const { firstName, lastName, email, password } = req.body;
  // Implement user creation
  try {
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const isMcGillMember = checkIsMcGillMember(email);

    // Create new user
    const newUser = new User({
      firstName,
      lastName,
      email,
      isMcGillMember,
      passwordHash: password, // The pre-save hook in user.js will hash this
    });

    await newUser.save();
    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Registration failed", error: error.message });
  }
});

// For all other routes, send back the index.html from the React app
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../client/dist", "index.html"));
});

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
