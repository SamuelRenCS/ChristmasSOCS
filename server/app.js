const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const cors = require("cors");

// middleware
const { validateUser } = require("./middleware");

// models
const User = require("./models/user");
const Meeting = require("./models/meeting");
const e = require("express");

// PUT IN ENV FILE LATER
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

// Serve static files from the React (Vite) app
app.use(express.static(path.join(__dirname, "../client/dist")));

// TODO: Move the api routes to separate file

// app.use('/api', require('./routes/api'));

// Serve the login api route
app.post("/api/login", async (req, res) => {
  console.log(req.body);
  const { email, password } = req.body;

  // basic input validation
  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

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

    console.log("Login successful");

    // Generate JWT
    const token = jwt.sign(
      {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        isMcGillMember: user.isMcGillMember,
      },
      SECRET_KEY,
      { expiresIn: "1h" }
    );

    // send successful login response
    res.status(200).json({
      message: "Login successful",
      data: {
        token,
        user: {
          id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          isMcGillMember: user.isMcGillMember,
        },
      },
    });
  } catch (error) {
    console.error("Login error:", error);

    // handle any unexpected errors
    res.status(500).json({ message: "Login failed", error: error.message });
  }
});

// Serve the register api route
app.post("/api/register", validateUser, async (req, res) => {
  console.log(req.body);
  const { firstName, lastName, email, password, confirmPassword } = req.body;

  // server-side validation
  if (!firstName || !lastName || !email || !password || !confirmPassword) {
    return res.status(400).json({ message: "All fields are required" });
  }

  // password validation
  if (password !== confirmPassword) {
    return res.status(400).json({ message: "Passwords do not match" });
  }

  // email validation
  if (!/\S+@\S+\.\S+/.test(email)) {
    return res.status(400).json({ message: "Invalid email address" });
  }

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
    console.error("Registration error:", error);

    // handle specific mongoose validation errors
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({
        message: "Validation failed",
        errors: messages,
      });
    }

    // generic server error
    res
      .status(500)
      .json({ message: "Registration failed", error: error.message });
  }
});

// Serve the meetings creation api route
// Check if user is authenticated
app.post("/api/meetings/new", async (req, res) => {
  console.log(req.body);
  const {
    title,
    host,
    date,
    startTime,
    endTime,
    location, 
    description,
    interval,
    seatsPerSlot,
    repeat,
    endDate,
  } = req.body;

  // server-side validation
  if (
    !title ||
    !date ||
    !startTime ||
    !endTime ||
    !location ||
    !seatsPerSlot ||
    !interval ||
    !host
  ) {
    return res.status(400).json({ message: "All fields are required" });
  }

  // If repeat is selected, check for an endDate
  if (repeat !== "none" && !endDate) {
    return res
      .status(400)
      .json({ message: "End date is required for repeating meetings" });
  }

  try {
    // Create new meeting
    const newMeeting = new Meeting({
      title,
      host,
      date,
      startTime,
      endTime,
      location, 
      description,
      interval,
      seatsPerSlot,
      repeat,
      endDate,
    });

    await newMeeting.save();

    //create token with meeting id

    const token = jwt.sign(newMeeting._id, SECRET_KEY);
    // Append the token to the meeting object
    newMeeting.token = token;

    // Save the meeting
    await newMeeting.save();

    res.status(201).json({
      message: "Meeting created successfully",
      token: newMeeting.token
    });
  } catch (error) {
    console.error("Meeting creation error:", error);

    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({
        message: "Validation failed",
        errors: messages,
      });
    }

    res
      .status(500)
      .json({ message: "Meeting creation failed", error: error.message });
  }
});

// Serve the meetings fetch api route.
// Query the meetings by MongoDB ID for the specific Meeting
//TODO CHECK THIS
app.get("/api/meetings/:id", async (req, res) => {
  const { id } = req.params; // Extract `id` from route parameters

  try {
    // Validate if `id` is provided
    if (!id) {
      return res.status(400).json({ message: "Meeting ID is required" });
    }

    // Fetch meeting by ID and populate the host details
    const meeting = await Meeting.findById(id).populate("host", "firstName lastName");

    if (!meeting) {
      return res.status(404).json({ message: "Meeting not found" });
    }

    // Return the meeting data
    res.status(200).json({ data: meeting });
  } catch (error) {
    console.error("Meeting fetch error:", error);
    res.status(500).json({ message: "Meeting fetch failed", error: error.message });
  }
});

// Serve the meeting slots fetch api route
// Meeting contains a list of slots called meetingSlots
app.get("/api/meetings/:id/:date", async (req, res) => {
  const { id, date } = req.params;

  try {
    const meeting = await Meeting.findById(id).populate("meetingSlots");

    if (!meeting) {
      return res.status(404).json({ message: "Meeting not found" });
    }

    // Filter slots by date
    const slots = meeting.meetingSlots.filter((slot) => {
      return slot.date.toDateString() === new Date(date).toDateString();
    });

    res.status(200).json({ data: slots });
  }
  catch (error) {
    console.error("Meeting slots fetch error:", error);
    res.status(500).json({ message: "Meeting slots fetch failed", error: error.message });
  }
});

// Serve the booking creation api route


// For all other routes, send back the index.html from the React app
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../client/dist", "index.html"));
});

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
