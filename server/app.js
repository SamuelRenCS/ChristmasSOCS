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
const MeetingSlot = require("./models/meetingSlot");


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
    startDate,
    endDate,
    location,
    description,
    interval,
    seatsPerSlot,
    repeat,
    endRepeatDate,
    repeatDays,
  } = req.body;

  //TODO
  // server-side validation
  if (
    !title ||
    !host ||
    !startDate ||
    !endDate ||
    !location ||
    !interval ||
    !seatsPerSlot ||
    !repeat
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
      startDate,
      endDate,
      location,
      description,
      interval,
      seatsPerSlot,
      repeat,
      endRepeatDate,
      repeatingDays: repeatDays,
    });

    await newMeeting.save();

    const payload = { ID: newMeeting._id };

    const newToken = jwt.sign(payload, SECRET_KEY, { algorithm: "HS256" });
    
    console.log("Token:", newToken);
    res.status(201).json({
      message: "Meeting created successfully",
      msgToken: newToken,
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

const calculateDates = (startDate, endDate) => {
  const dates = [];
  let currentDate = new Date(startDate);

  while (currentDate <= endDate) {
    dates.push(new Date(currentDate)); // Push the date
    currentDate.setDate(
      currentDate.getDate() + 1
    ); // Increment based on interval
  }

  return dates;
};

// Inputs an array of repeating days and the end date. Every repeating day should repeat weekly until the end date
const calculateWeeklyDates = (repeatingDays, endDate) => {
  const dates = [];

  for (let i = 0; i < repeatingDays.length; i++) {
    let currentDate = new Date(repeatingDays[i]);
    while (currentDate <= endDate) {
      dates.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 7); // Increment by 7 days
    }
  }

  return dates;
}


app.get("/api/meetings/:token", async (req, res) => {

  const iToken = req.params.token;

  // Extract the meeting ID from the token and validate the token that is stored in the meeting object
  try {

    if (!iToken) {
      return res.status(400).json({ message: "Token is required" });
    }

    const decoded = jwt.verify(iToken, SECRET_KEY);
    const meetingID = decoded.ID;

    if (!meetingID) {
      return res.status(400).json({ message: "Invalid token" });
    }

    const meeting = await Meeting.findById(meetingID).populate("host", "firstName lastName");

    if (!meeting) {
      return res.status(404).json({ message: "Meeting not found" });
    } 

    const { title, host, startDate, endDate, location, description, interval, seatsPerSlot, repeat, endRepeatDate, repeatingDays } = meeting;
    let dates = [];
    let formattedDates = [];


    if (repeat === "None") {
      
      dates = calculateDates(startDate, endDate);
      formattedDates = dates.map(date => date.toISOString().split('T')[0]);
      return res.status(200).json({ data: { title, host, startDate, endDate, location, description, interval, seatsPerSlot, repeat, endRepeatDate, formattedDates, meetingID } });

    } else if (repeat === "Daily") {

      dates = calculateDates(startDate, endRepeatDate);
      formattedDates = dates.map(date => date.toISOString().split('T')[0]);
      return res.status(200).json({ data: { title, host, startDate, endDate, location, description, interval, seatsPerSlot, repeat, endRepeatDate, formattedDates, meetingID } });
  
    } else if (repeat === "Weekly") {

      dates = calculateWeeklyDates(repeatingDays, endRepeatDate);
      formattedDates = dates.map(date => date.toISOString().split('T')[0]);
      return res.status(200).json({ data: { title, host, startDate, endDate, location, description, interval, seatsPerSlot, repeat, endRepeatDate, formattedDates, meetingID } });
    } else {
      return res.status(400).json({ message: "Invalid repeat value" });
    }

  } catch (error) {
    console.error("Meeting fetch error:", error);
    res
      .status(500)
      .json({ message: "Meeting fetch failed", error: error.message });
  }
});

const generateSlots = (startTime, endTime, interval) => {
  const slots = [];
  const start = new Date(startTime);
  const end = new Date(endTime);
  
  let current = new Date(start);
  let currentDay = current.toDateString();
  let daySlots = [];

  while (current <= end) {
    // Check if we've moved to a new day
    if (current.toDateString() !== currentDay) {
      // Add the previous day's slots to the main array
      if (daySlots.length > 0) {
        slots.push(daySlots);
      }
      
      // Reset for the new day
      daySlots = [];
      currentDay = current.toDateString();
    }

    // Add current time slot to the day's slots
    daySlots.push(
      current.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      })
    );

    // Increment time
    current.setMinutes(current.getMinutes() + interval);
  }

  // Add the last day's slots if not empty
  if (daySlots.length > 0) {
    slots.push(daySlots);
  }

  return slots;
};



// Serve the meeting slots fetch api route
// Meeting contains a list of slots called meetingSlots
app.get("/api/meetings/:meetingID/:date", async (req, res) => {
  const { meetingID, date } = req.params;

  //convert date to a date object matching the format ISODate('2024-12-19T04:30:00.000Z')
  const dateObj = new Date(date);

  console.log("Date:", dateObj);

  try {
    if (!meetingID || !date) {
      return res.status(400).json({ message: "Meeting ID and date are required" });
    }

    const meeting = await Meeting.findById(meetingID);

    //retrieve the meeting start and end date and interval
    const startDate = new Date(meeting.startDate);
    const endDate = new Date(meeting.endDate);
    const interval = meeting.interval;

    console.log("Start Date:", startDate);
    console.log("End Date:", endDate);

    if (!meeting) {
      return res.status(404).json({ message: "Meeting not found" });
    }

    //retrieve only the meeting slots for the given date
    const meetingSlots = meeting.meetingSlots.filter((slot) => slot.date === date);

    console.log("meetingSlots", meetingSlots);

    const bookedSlots = meetingSlots.filter((slot) => slot.date === date).map((slot) => slot.startTime);

    console.log("bookedSlots", bookedSlots);

    // find slots that have 0 seats available
    const slotsWithSeats = meetingSlots.filter((slot) => slot.seatsAvailable > 0).map((slot) => slot.startTime);

    console.log("slotsWithSeats", slotsWithSeats);

    const allSlots = generateSlots(startDate, endDate, interval);
    console.log("allSlots", allSlots);
    
    let possibleSlots = [];

    const cmpDate = new Date(date).toISOString().split('T')[0]; // Get date portion in UTC
    console.log("cmpDate", cmpDate);

    const cmpStartDate = new Date(startDate).toISOString().split('T')[0]; // Get date portion in UTC
    console.log("cmpStartDate", cmpStartDate);

    const cmpEndDate = new Date(endDate).toISOString().split('T')[0]; // Get date portion in UTC
    console.log("cmpEndDate", cmpEndDate);
   
    if (cmpStartDate === cmpEndDate) {
      // Case 1: Start and end dates are the same day
      possibleSlots = allSlots[0];
    } else if (cmpDate === cmpStartDate) {
      console.log("Start date");
      possibleSlots = allSlots[0];
    } else if (cmpDate === cmpEndDate) {
      // Case 3: Current date is the end date
      console.log("End date");
      possibleSlots = allSlots[allSlots.length - 1];
    } else if (cmpDate > cmpStartDate && cmpDate < cmpEndDate) {
      // Case 4: Date is between start and end dates
      console.log("In between");
      const diff = Math.floor((new Date(date).setHours(0,0,0,0) - new Date(startDate).setHours(0,0,0,0)) / (1000 * 60 * 60 * 24));
      possibleSlots = allSlots[diff];
    } else {
      return res.status(400).json({ message: "Invalid date" });
    }

    console.log("possibleSlots", possibleSlots);

    // remove slots that are booked and have no seats available
    const finalSlots = possibleSlots.filter((slot) => !bookedSlots.includes(slot) && !slotsWithSeats.includes(slot));
    console.log("finalSlots", finalSlots);

    res.status(200).json({ data: {finalSlots } });

  } catch (error) {
    console.error("Meeting slots fetch error:", error);
    res
      .status(500)
      .json({ message: "Meeting slots fetch failed", error: error.message });
  }
});

app.get("/api/meetings/:meetingID/:date/:slot", async (req, res) => {
  const { meetingID, date, slot } = req.params;
  console.log("Meeting ID:", meetingID);

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
      return res.status(200).json({ data: { seats: meeting.seatsPerSlot } });
    } else {
      const seatsLeft = meetingSlot.seatsAvailable;
      res.status(200).json({ data: { seats : seatsLeft } });
    }

  } catch (error) {
    console.error("Meeting slots fetch error:", error);
    res
      .status(500)
      .json({ message: "Meeting slots fetch failed", error: error.message });
  }
});

// Serve the booking creation api route

app.post("/api/bookings/new", async (req, res) => {
  console.log(req.body);
  const { meetingID, date, slot, name } = req.body;

  try {
    if (!meetingID || !date || !slot || !name) {
      return res.status(400).json({ message: "Meeting ID, date, slot, and name are required" });
    }

    const meeting = await Meeting.findById(meetingID);

    if (!meeting) {
      return res.status(404).json({ message: "Meeting not found" });
    }

    //check if a meeting slot exists for the given date and slot
    const meetingSlot = meeting.meetingSlots.find((slot) => slot.date === date && slot.startTime === slot);

    if (!meetingSlot) {
      return res.status(404).json({ message: "Meeting slot not found" });
    }

    //check if there are any seats available
    if (meetingSlot.seatsAvailable === 0) {
      return res.status(400).json({ message: "No seats available for this slot" });
    }

    //create a new booking
    meetingSlot.attendees.push(name);
    meetingSlot.seatsAvailable -= 1;

    await meeting.save();

    res.status(201).json({ message: "Booking created successfully" });

  } catch (error) {
    console.error("Booking creation error:", error);
    res
      .status(500)
      .json({ message: "Booking creation failed", error: error.message });
  }
}
);

// For all other routes, send back the index.html from the React app
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../client/dist", "index.html"));
});

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
