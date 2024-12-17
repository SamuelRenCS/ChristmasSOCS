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
  if (repeat !== "None" && !endDate) {
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
      token: "UNSET",
    });

    await newMeeting.save();

    const payload = { meetingID: newMeeting._id };

    const newToken = jwt.sign(payload, SECRET_KEY);
    // Append the token to the meeting object
    newMeeting.token = newToken;

    // Save the meeting
    await newMeeting.save();

    res.status(201).json({
      message: "Meeting created successfully",
      msgToken: newMeeting.token,
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

const calculateDates = (startDate, endDate, repeat) => {
  const dates = [];
  let currentDate = new Date(startDate);

  while (currentDate <= endDate) {
    dates.push(new Date(currentDate)); // Push the date
    currentDate.setDate(
      currentDate.getDate() + (repeat === "Daily" ? 1 : 7)
    ); // Increment based on interval
  }

  return dates;
};

app.get("/api/meetings/:token", async (req, res) => {

  const iToken = req.params.token;

  // Extract the meeting ID from the token and validate the token that is stored in the meeting object
  try {

    if (!iToken) {
      return res.status(400).json({ message: "Token is required" });
    }

    const decoded = jwt.verify(iToken, SECRET_KEY);
    const meetingID = decoded.meetingID;

    const meeting = await Meeting.findById(meetingID).populate("host", "firstName lastName");

    if (!meeting) {
      return res.status(404).json({ message: "Meeting not found" });
    } 

    // Compare the token in the meeting object with the token in the request
    if (meeting.token !== iToken) {
      return res.status(401).json({ message: "Unauthorized access" });
    }

    const { title, host, date, startTime, endTime, location, description, interval, seatsPerSlot, repeat, endDate } = meeting;

    const dates = calculateDates(date, endDate, repeat);

    const formattedDates = dates.map(date => date.toISOString().split('T')[0]);

    res.status(200).json({ data: { title, host, date, startTime, endTime, location, description, interval, seatsPerSlot, repeat, endDate, formattedDates, meetingID } });

  } catch (error) {
    console.error("Meeting fetch error:", error);
    res
      .status(500)
      .json({ message: "Meeting fetch failed", error: error.message });
  }
});


// Serve the meeting slots fetch api route
// Meeting contains a list of slots called meetingSlots
app.get("/api/meetings/:meetingID/:date", async (req, res) => {
  const { meetingID, date } = req.params;

  try {
    if (!meetingID || !date) {
      return res.status(400).json({ message: "Meeting ID and date are required" });
    }

    const meeting = await Meeting.findById(meetingID);

    if (!meeting) {
      return res.status(404).json({ message: "Meeting not found" });
    }

    // Compare the token in the meeting object with the token in the request
    if (meeting.token !== meetingID) {
      return res.status(401).json({ message: "Unauthorized access" });
    }

    const meetingSlots = meeting.populate("meetingSlots");
    const bookedSlots = meetingSlots.filter((slot) => slot.date === date).map((slot) => slot.startTime);

    // remove the slots that have 0 seats available
    
    const slotsWithSeats = meetingSlots.filter((slot) => slot.seatsAvailable > 0);


    const allSlots = generateSlots(startTime, endTime, interval);

    const generateSlots = (startTime, endTime, interval) => {
      const slots = [];
      const start = startTime; // Base date for time calculation
      const end = endTime;

      let current = new Date(start);

      while (current < end) {
        slots.push(
          current.toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
          })
        );
        current.setMinutes(current.getMinutes() + interval); // Increment by interval
      }

      return slots;
    };

    const availableSlots = allSlots.filter((slot) => !bookedSlots.includes(slot));

    res.status(200).json({ data: {availableSlots } });

  } catch (error) {
    console.error("Meeting slots fetch error:", error);
    res
      .status(500)
      .json({ message: "Meeting slots fetch failed", error: error.message });
  }
});

app.get("/api/bookings/:meetingID/:date/:slot", async (req, res) => {
  const { meetingID, date, slot } = req.params;

  try {
    if (!meetingID || !date || !slot) {
      return res.status(400).json({ message: "Meeting ID, date, and slot are required" });
    }

    const meeting = await Meeting.findById(meetingID);

    if (!meeting) {
      return res.status(404).json({ message: "Meeting not found" });
    }

    //check is a meeintg slot exists for the given date and slot
    const meetingSlot = meeting.meetingSlots.find((slot) => slot.date === date && slot.startTime === slot);

    // if no meeting slot is found, return the max seats for the meeting
    if (!meetingSlot) {
      return res.status(200).json({ data: { maxSeats: meeting.seatsPerSlot } });
    } else {
      const seats = meetingSlot.seatsAvailable;
      res.status(200).json({ data: { seats } });
    }

  } catch (error) {
    console.error("Meeting slots fetch error:", error);
    res
      .status(500)
      .json({ message: "Meeting slots fetch failed", error: error.message });
  }
});

// For all other routes, send back the index.html from the React app
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../client/dist", "index.html"));
});

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
