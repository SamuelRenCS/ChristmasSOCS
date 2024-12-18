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
const Request = require("./models/request");
const e = require("express");
const MeetingSlot = require("./models/meetingSlot");
const Notification = require("./models/notification");

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
    origin: [
      "http://localhost:5173",
      "http://fall2024-comp307-group12.cs.mcgill.ca:5000",
    ],
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

    if (!isMcGillMember) {
      return res.status(400).json({
        message: "Only McGill students and staff can register",
      });
    }

    // Create new user
    const newUser = new User({
      firstName,
      lastName,
      email,
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

// Serve the change password api route
app.put("/api/password", async (req, res) => {
  console.log(req.body);
  const { userId, currentPassword, newPassword } = req.body;

  if (!userId || !currentPassword || !newPassword) {
    return res.status(400).json({
      message: "User ID, current password, and new password are required",
    });
  }

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check current password
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid current password" });
    }

    // Update password
    user.passwordHash = newPassword;
    await user.save();

    res.status(200).json({ message: "Password updated successfully" });
  } catch (error) {
    console.error("Password update error:", error);

    res
      .status(500)
      .json({ message: "Password update failed", error: error.message });
  }
});

// get user info
app.get("/api/user/:userID", async (req, res) => {
  const { userID } = req.params;

  try {
    if (!userID) {
      return res.status(400).json({ message: "User ID is required" });
    }

    const user = await User.findById(userID);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      data: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
      },
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "User fetch failed", error: error.message });
  }
});

// handle request creation
app.post("/api/requests/new", async (req, res) => {
  const {
    requester,
    host,
    title,
    location,
    startDate,
    endDate,
    numberOfSeats,
    description,
  } = req.body;

  if (!requester || !host || !title || !location || !startDate || !endDate) {
    return res.status(400).json({
      message:
        "Requester, host, title, location, start date, and end date are required",
    });
  }

  try {
    // check if valid requester
    const requesterUser = await User.findById(requester);
    if (!requesterUser) {
      return res.status(404).json({ message: "Requester not found" });
    }

    // check if valid host
    const hostUser = await User.findById(host);
    if (!hostUser) {
      return res.status(404).json({ message: "Host not found" });
    }

    // create new request
    const newRequest = new Request({
      requester,
      host,
      requesterName: `${requesterUser.firstName} ${requesterUser.lastName}`,
      title,
      location,
      startDate,
      endDate,
      numberOfSeats,
      description,
    });

    await newRequest.save();

    res.status(201).json({ message: "Request created successfully" });
  } catch (error) {
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({
        message: "Validation failed",
        errors: messages,
      });
    }
    res
      .status(500)
      .json({ message: "Request creation failed", error: error.message });
  }
});

// get requests for a user
app.get("/api/requests/:userID", async (req, res) => {
  const { userID } = req.params;

  try {
    if (!userID) {
      return res.status(400).json({ message: "User ID is required" });
    }

    // find Confirmed requests, where requester or host is the user
    const confirmedRequests = await Request.find({
      $or: [{ requester: userID }, { host: userID }],
      approved: true,
    });

    // find requests that have not been accepted as the host
    const incomingRequests = await Request.find({
      host: userID,
      approved: false,
    });

    // find requests that have not been accepted as the requester
    const outgoingRequests = await Request.find({
      requester: userID,
      approved: false,
    });

    res.status(200).json({
      data: { confirmedRequests, incomingRequests, outgoingRequests },
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Request fetch failed", error: error.message });
  }
});

// handle accept request
app.put("/api/requests/:requestID", async (req, res) => {
  const { requestID } = req.params;

  try {
    if (!requestID) {
      return res.status(400).json({ message: "Request ID is required" });
    }

    const request = await Request.findById(requestID);

    if (!request) {
      return res.status(404).json({ message: "Request not found" });
    }

    request.approved = true;
    await request.save();

    res.status(200).json({ message: "Request accepted successfully", request });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Request acceptance failed", error: error.message });
  }
});

// handle request rejection
app.delete("/api/requests/:requestID", async (req, res) => {
  const { requestID } = req.params;

  try {
    // Validate if `requestID` is a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(requestID)) {
      return res.status(400).json({ message: "Invalid request ID" });
    }

    // Find and delete the request
    const deletedRequest = await Request.findByIdAndDelete(requestID);

    if (!deletedRequest) {
      return res.status(404).json({ message: "Request not found" });
    }

    res
      .status(200)
      .json({ message: "Request rejected successfully", deletedRequest });
  } catch (error) {
    console.error("Error rejecting request:", error.message);
    res
      .status(500)
      .json({ message: "Request rejection failed", error: error.message });
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

    const allSlots = generateSlots(startDate, endDate, interval);
    console.log("All slots:", allSlots);

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
      validSlots: allSlots,
    });

    await newMeeting.save();

    //save the meeting under the host
    const hostUser = await User.findById(host);
    console.log("Host user:", hostUser);

    if (hostUser) {
      // Push the meeting ID to the meetings array
      // Initialize meetings array if it doesn't exist
      if (!hostUser.meetings) {
        hostUser.meetings = [];
      }
      hostUser.meetings.push(newMeeting._id);
      // Save the user
      await hostUser.save();
    }

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
  // Create new Date objects to avoid mutating the originals
  let current = new Date(startDate);
  const end = new Date(endDate);

  // Create comparison dates without changing the originals
  const startCompare = new Date(startDate);
  startCompare.setUTCHours(0, 0, 0, 0);
  const endCompare = new Date(endDate);
  endCompare.setUTCHours(23, 59, 59, 999);

  while (current <= end) {
    dates.push(new Date(current));
    current.setDate(current.getDate() + 1);
  }

  return dates;
};

const calculateWeeklyDates = (repeatingDays, endDate) => {
  const dates = [];

  // Reset endDate time to ensure the comparison is only date-based
  endDate.setHours(23, 59, 59, 999);

  for (let i = 0; i < repeatingDays.length; i++) {
    let currentDate = new Date(repeatingDays[i]);

    // Reset the time of currentDate to ensure comparison is only date-based
    currentDate.setHours(0, 0, 0, 0);

    // If the initial repeating day is after the end date, skip to next
    if (currentDate > endDate) {
      continue;
    }

    while (currentDate <= endDate) {
      dates.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 7); // Increment by 7 days
    }
  }

  return dates;
};

const generateSlots = (startTime, endTime, interval) => {
  const slots = [];
  const start = new Date(startTime);
  const end = new Date(endTime);

  // Check if the interval equals the entire duration
  const durationInMinutes = (end - start) / (1000 * 60); // Convert milliseconds to minutes
  if (interval >= durationInMinutes) {
    // If the interval is equal to or greater than the entire duration, only add the start time
    slots.push([
      start.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    ]);
    return slots;
  }

  let current = new Date(start);
  let currentDay = current.toDateString();
  let daySlots = [];

  while (current < end) {
    // Modified condition to exclude the end time
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

  // Add the last day's slots if there are any
  if (daySlots.length > 0) {
    slots.push(daySlots);
  }

  return slots;
};

app.get("/api/meetings/:token", async (req, res) => {
  const iToken = req.params.token;
  let meetingID = req.params.token;
  // Extract the meeting ID from the token and validate the token that is stored in the meeting object
  try {
    if (!iToken) {
      return res.status(400).json({ message: "Token is required" });
    }

    let meeting;

    try {
      // check if the token is a meeting ID
      meeting = await Meeting.findById(iToken);
    } catch (error) {
      // if the token is not a meeting ID, try decoding it
      const decoded = jwt.verify(iToken, SECRET_KEY);
      meetingID = decoded.ID;

      if (!meetingID) {
        return res.status(400).json({ message: "Invalid token" });
      }

      meeting = await Meeting.findById(meetingID).populate(
        "host",
        "firstName lastName"
      );

      if (!meeting) {
        return res.status(404).json({ message: "Meeting not found" });
      }
    }

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
      repeatingDays,
    } = meeting;

    let dates = [];
    let formattedDates = [];

    if (repeat === "None") {
      if (
        interval !== 10 &&
        interval !== 15 &&
        interval !== 20 &&
        interval !== 30 &&
        interval !== 60
      ) {
        dates = calculateDates(startDate, startDate);
      } else {
        dates = calculateDates(startDate, endRepeatDate);
      }

      console.log("Dates:", dates);
      formattedDates = dates.map((date) => date.toISOString().split("T")[0]);
      return res.status(200).json({
        data: {
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
          formattedDates,
          meetingID,
        },
      });
    } else if (repeat === "Daily") {
      dates = calculateDates(startDate, endRepeatDate);
      formattedDates = dates.map((date) => date.toISOString().split("T")[0]);
      return res.status(200).json({
        data: {
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
          formattedDates,
          meetingID,
        },
      });
    } else if (repeat === "Weekly") {
      dates = calculateWeeklyDates(repeatingDays, endRepeatDate);
      formattedDates = dates.map((date) => date.toISOString().split("T")[0]);
      return res.status(200).json({
        data: {
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
          formattedDates,
          meetingID,
        },
      });
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

// Serve the meeting slots fetch api route
// Meeting contains a list of slots called meetingSlots
app.get("/api/meetings/:meetingID/:date", async (req, res) => {
  const { meetingID, date } = req.params;

  try {
    if (!meetingID || !date) {
      return res
        .status(400)
        .json({ message: "Meeting ID and date are required" });
    }

    const meeting = await Meeting.findById(meetingID).populate("meetingSlots");

    //retrieve the meeting start and end date and interval
    const startDate = new Date(meeting.startDate);
    const endDate = new Date(meeting.endDate);
    //const interval = meeting.interval;

    console.log("Start Date:", startDate);
    console.log("End Date:", endDate);

    if (!meeting) {
      return res.status(404).json({ message: "Meeting not found" });
    }
    const cmpDate = new Date(date).toISOString().split("T")[0]; // Get date portion in UTC
    console.log("cmpDate", cmpDate);
    //CHECK IF DATE COMPARISON IS VALID
    const populatedMeetingSlots = await meeting.populate("meetingSlots");
    const meetingSlots = populatedMeetingSlots.meetingSlots;

    console.log("Meeting slots:", meetingSlots);
    const fileteredSlots = meetingSlots.filter(
      (slot) =>
        new Date(slot.occurrenceDate).toISOString().split("T")[0] === cmpDate
    );

    console.log("fileteredSlots", fileteredSlots);

    // find slots that have 0 seats available
    const slotsWithNoSeats = fileteredSlots
      .filter((slot) => slot.seatsAvailable <= 0)
      .map((slot) => slot.startTime);

    console.log("slotsWithNoSeats", slotsWithNoSeats);

    formattedNoSeats = slotsWithNoSeats.map((slot) => {
      const date = new Date(slot);
      return date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
    });

    console.log("formattedNoSeats", formattedNoSeats);

    const allSlots = meeting.validSlots;
    console.log("allSlots", allSlots);

    let possibleSlots = [];

    const cmpStartDate = new Date(startDate).toISOString().split("T")[0]; // Get date portion in UTC
    console.log("cmpStartDate", cmpStartDate);

    const cmpEndDate = new Date(endDate).toISOString().split("T")[0]; // Get date portion in UTC
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
      const diff = Math.floor(
        (new Date(date).setHours(0, 0, 0, 0) -
          new Date(startDate).setHours(0, 0, 0, 0)) /
          (1000 * 60 * 60 * 24)
      );
      possibleSlots = allSlots[diff];
    } else {
      return res.status(400).json({ message: "Invalid date" });
    }

    console.log("possibleSlots", possibleSlots);

    // remove slots that are booked and have no seats available
    const finalSlots = possibleSlots.filter(
      (slot) => !formattedNoSeats.includes(slot)
    );
    console.log("finalSlots", finalSlots);

    res.status(200).json({ data: { finalSlots } });
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

  const savedDate = new Date(date);
  const slotString = `${savedDate.toISOString().split("T")[0]} ${slot}`;
  const slotTime = new Date(slotString);
  console.log("Slot time:", slotTime);

  try {
    if (!meetingID || !date || !slot) {
      return res
        .status(400)
        .json({ message: "Meeting ID, date, and slot are required" });
    }

    const meeting = await Meeting.findById(meetingID).populate("meetingSlots");

    if (!meeting) {
      return res.status(404).json({ message: "Meeting not found" });
    }

    //TODO COMPARE WITH THE ACTUAL TIME
    const meetingSlot = meeting.meetingSlots.find((slot) => {
      return (
        new Date(slot.startTime).getTime() === new Date(slotTime).getTime()
      );
    });
    console.log("Meeting slot:", meetingSlot);

    // if no meeting slot is found, return the max seats for the meeting
    if (!meetingSlot) {
      return res.status(200).json({ data: { seats: meeting.seatsPerSlot } });
    } else {
      const seatsLeft = meetingSlot.seatsAvailable;
      console.log("Seats left:", seatsLeft);
      res.status(200).json({ data: { seats: seatsLeft } });
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
  console.log("Booking request:");
  console.log(req.body);
  const { attendee, meetingID, userID, meetingDate, timeSlot, seats } =
    req.body;

  console.log("User ID:", userID);
  // server-side validation
  if (!attendee || !meetingID || !meetingDate || !timeSlot || !seats) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    // check if a booking slot already exists for that time slot

    console.log("Meeting date:", meetingDate);

    const meeting = await Meeting.findById(meetingID).populate("meetingSlots");
    const existingSlots = meeting.meetingSlots.filter(
      (slot) => slot.occurrenceDate.toISOString().split("T")[0] === meetingDate
    );
    const interval = meeting.interval;
    const savedDate = new Date(meetingDate);
    const startString = `${savedDate.toISOString().split("T")[0]} ${timeSlot}`;
    const startTime = new Date(startString).toISOString();
    let endTime = new Date(startTime); // Create a new Date object to avoid mutating the original
    console.log("end time 1", endTime);
    endTime.setMinutes(endTime.getMinutes() + interval);
    console.log("end time 2", endTime);

    //TODO WRONG
    const endTimeHours = endTime.getHours();
    const endTimeMinutes = endTime.getMinutes();

    const meetingEndDateHours = meeting.endDate.getHours();
    const meetingEndDateMinutes = meeting.endDate.getMinutes();

    if (
      meeting.repeat === "Daily" &&
      (endTimeHours > meetingEndDateHours ||
        (endTimeHours === meetingEndDateHours &&
          endTimeMinutes > meetingEndDateMinutes))
    ) {
      // Set endTime to meeting endDate if the end time exceeds the meeting's end time
      endTime.setHours(meetingEndDateHours);
      endTime.setMinutes(meetingEndDateMinutes);
    } else if (
      meeting.repeat === "Weekly" &&
      (endTimeHours > meetingEndDateHours ||
        (endTimeHours === meetingEndDateHours &&
          endTimeMinutes > meetingEndDateMinutes))
    ) {
      // Set endTime to meeting endDate if the end time exceeds the meeting's end time
      endTime.setHours(meetingEndDateHours);
      endTime.setMinutes(meetingEndDateMinutes);
    } else if (
      meeting.repeat === "None" &&
      (endTimeHours > meetingEndDateHours ||
        (endTimeHours === meetingEndDateHours &&
          endTimeMinutes > meetingEndDateMinutes))
    ) {
      // Set endTime to meeting endDate if the end time exceeds the meeting's end time
      endTime = meeting.endDate;
    }

    endTime = endTime.toISOString();
    console.log("Start time:", startTime);
    console.log("End time:", endTime);

    if (existingSlots.length === 0) {
      const newSlot = new MeetingSlot({
        meeting: meetingID,
        occurrenceDate: savedDate.toISOString(),
        startTime,
        endTime,
        //push the attendee to the attendees array
        attendees: [attendee],
        seatsAvailable: meeting.seatsPerSlot - seats,
      });

      //save the new booking
      await newSlot.save();
      //add the booking to the meeting
      meeting.meetingSlots.push(newSlot);
      await meeting.save();
      //check if a user is logged in and add the booking to the user
      if (userID && userID !== "") {
        console.log("User ID:", userID);
        const user = await User.findById(userID);
        user.reservations.push(newSlot);
        await user.save();

        //add the user to the list of registered attendees for the slot
        newSlot.registeredAttendees.push({
          attendeeId: userID, // The user's ID
          seatsBooked: seats, // Number of seats booked
        });
        await newSlot.save();
      }
      return res.status(201).json({ message: "Booking created successfully" });
    } else {
      // check is there is a slot for that date and time
      const existingSlot = existingSlots.find(
        (slot) => slot.startTime === startTime
      );
      if (!existingSlot) {
        const newSlot = new MeetingSlot({
          meeting: meetingID,
          occurrenceDate: savedDate.toISOString(),
          startTime,
          endTime,
          //push the attendee to the attendees array
          attendees: [attendee],
          seatsAvailable: meeting.seatsPerSlot - seats,
        });

        //save the new booking
        await newSlot.save();
        //add the booking to the meeting
        meeting.meetingSlots.push(newSlot);
        await meeting.save();
        //check if a user is logged in and add the booking to the user
        if (userID && userID !== "") {
          console.log("User ID:", userID);
          const user = await User.findById(userID);
          user.reservations.push(newSlot);
          await user.save();

          //add the user to the list of registered attendees for the slot
          newSlot.registeredAttendees.push({
            attendeeId: userID, // The user's ID
            seatsBooked: seats, // Number of seats booked
          });

          await newSlot.save();
        }
        return res
          .status(201)
          .json({ message: "Booking created successfully" });
      } else {
        //push the attendee to the attendees array
        existingSlot.attendees.push(attendee);
        //update the seats available
        existingSlot.seatsAvailable -= seats;
        await existingSlot.save();

        //check if a user is logged in and add the booking to the user
        if (userID) {
          const user = await User.findById(userID);
          user.reservations.push(existingSlot);
          await user.save();

          //add the user to the list of registered attendees for the slot
          existingSlot.registeredAttendees.push({
            attendeeId: userID, // The user's ID
            seatsBooked: seats, // Number of seats booked
          });
          await existingSlot.save();
        }
        return res
          .status(201)
          .json({ message: "Booking created successfully" });
      }
    }
  } catch (error) {
    console.error("Booking creation error:", error);

    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({
        message: "Validation failed",
        errors: messages,
      });
    }

    res
      .status(500)
      .json({ message: "Booking creation failed", error: error.message });
  }
});

//fetch the meetings a user has created
app.get("/api/dashboard/meetings/:userID", async (req, res) => {
  const { userID } = req.params;

  console.log("User ID:", userID);
  try {
    if (!userID) {
      return res.status(400).json({ message: "User ID is required" });
    }

    const meetings = await Meeting.find({ host: userID });
    console.log("Meetings:", meetings);

    //return a list of meeting IDs with the corresponding title, location
    const meetingList = meetings.map((meeting) => ({
      id: meeting._id,
      title: meeting.title,
      location: meeting.location,
    }));

    res.status(200).json({ data: meetingList });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Meeting fetch failed", error: error.message });
  }
});

//fetch the bookings a user has made
app.get("/api/dashboard/bookings/:userID", async (req, res) => {
  const { userID } = req.params;

  console.log("User ID:", userID);
  try {
    if (!userID) {
      return res.status(400).json({ message: "User ID is required" });
    }

    const user = await User.findById(userID).populate({
      path: "reservations",
      populate: {
        path: "meeting",
      },
    });

    // Return a list of meeting IDs with the corresponding title, location
    const bookingList = user.reservations.map((booking) => {
      // Format the occurrence date (keep it in UTC and extract the date portion)
      const occurrenceDate = new Date(booking.occurrenceDate);
      const formattedDate = `${occurrenceDate.getUTCFullYear()}-${(
        occurrenceDate.getUTCMonth() + 1
      )
        .toString()
        .padStart(2, "0")}-${occurrenceDate
        .getUTCDate()
        .toString()
        .padStart(2, "0")}`;

      // Format the start time (keep it in UTC)
      const startTime = new Date(booking.startTime);
      const formattedStartTime = startTime.toISOString().substring(11, 16); // HH:mm format (UTC)

      // Format the end time (keep it in UTC)
      const endTime = new Date(booking.endTime);
      const formattedEndTime = endTime.toISOString().substring(11, 16); // HH:mm format (UTC)

      return {
        id: booking._id,
        title: booking.meeting.title,
        location: booking.meeting.location,
        date: formattedDate, // UTC formatted occurrence date
        startTime: formattedStartTime, // UTC formatted start time
        endTime: formattedEndTime, // UTC formatted end time
      };
    });

    res.status(200).json({ data: bookingList });
  } catch (error) {
    console.error("Error fetching bookings: ", error);
    res
      .status(500)
      .json({ message: "Booking fetch failed", error: error.message });
  }
});

//fetches all the bookings a user has made and all the slots for meetings the user has created
//For the meetings the user has created, each event should have the list of attendees
//For meetings the user has booked, the event should have the host name
app.get("/api/dashboard/events/:userID", async (req, res) => {
  const { userID } = req.params;

  console.log("User ID:", userID);
  try {
    if (!userID) {
      return res.status(400).json({ message: "User ID is required" });
    }

    //Populate the host under the meeting object
    const user = await User.findById(userID).populate({
      path: "reservations",
      populate: {
        path: "meeting",
        populate: { path: "host", select: "firstName lastName" },
      },
    });

    const meetings = await Meeting.find({ host: userID }).populate(
      "meetingSlots"
    );

    //return a list of meeting IDs with the corresponding title, location, date, start time, end time, and attendees
    const eventList = [];

    // Add the meetings the user has created. Each slot is an event. Take the attendees array from the slot (not registeredAttendees)
    meetings.forEach((meeting) => {
      meeting.meetingSlots.forEach((slot) => {
        const attendees = slot.attendees.map((attendee) => attendee);
        eventList.push({
          title: meeting.title,
          location: meeting.location,
          date: slot.occurrenceDate,
          startTime: slot.startTime,
          endTime: slot.endTime,
          attendees,
        });
      });
    });

    // Add the bookings the user has made. Each booking is an event. Take the host name from the meeting
    user.reservations.forEach((booking) => {
      const hostName = `${booking.meeting.host.firstName} ${booking.meeting.host.lastName}`;

      eventList.push({
        title: booking.meeting.title,
        location: booking.meeting.location,
        date: booking.occurrenceDate,
        startTime: booking.startTime,
        endTime: booking.endTime,
        host: hostName,
      });
    });

    console.log("Event list:", eventList);

    res.status(200).json({ data: eventList });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Event fetch failed", error: error.message });
  }
});

//generate the token for the meeting
app.get("/api/token/:meetingID", async (req, res) => {
  const { meetingID } = req.params;

  try {
    if (!meetingID) {
      return res.status(400).json({ message: "Meeting ID is required" });
    }

    const payload = { ID: meetingID };
    const token = jwt.sign(payload, SECRET_KEY, { algorithm: "HS256" });

    console.log("Token:", token);

    res.status(200).json({ data: { token } });
  } catch (error) {
    console.error("Token generation error:", error);
    res
      .status(500)
      .json({ message: "Token generation failed", error: error.message });
  }
});

app.delete("/api/meetings/delete/:meetingID", async (req, res) => {
  const { meetingID } = req.params;

  try {
    if (!meetingID) {
      return res.status(400).json({ message: "Meeting ID is required" });
    }

    // Find the meeting and populate the necessary fields
    const meeting = await Meeting.findById(meetingID).populate({
      path: "meetingSlots",
      populate: {
        path: "registeredAttendees",
      },
    });

    if (!meeting) {
      return res.status(404).json({ message: "Meeting not found" });
    }

    // Get the list of attendees from the meeting slots
    const attendees = meeting.meetingSlots.flatMap(
      (slot) => slot.registeredAttendees
    );

    // Update each attendee's reservations
    for (const attendee of attendees) {
      // Ensure the reservations array exists before filtering
      if (attendee.reservations && Array.isArray(attendee.reservations)) {
        attendee.reservations = attendee.reservations.filter(
          (reservation) => reservation.meeting.toString() !== meetingID
        );
        // Save the updated attendee
        await attendee.save();
      }
    }

    // Log number of attendees whose reservations were updated
    console.log(`Updated reservations for ${attendees.length} attendees.`);

    // Delete the meeting
    const deletedMeeting = await Meeting.findByIdAndDelete(meetingID);
    if (!deletedMeeting) {
      return res.status(404).json({ message: "Meeting not found" });
    }

    // Delete all associated meeting slots
    await MeetingSlot.deleteMany({ meeting: meetingID });

    // Remove the meeting from the host's list of meetings
    const host = await User.findById(deletedMeeting.host);
    if (host) {
      host.meetings = host.meetings.filter(
        (meeting) => meeting.toString() !== meetingID
      );
      await host.save();
    } else {
      console.error(`Host with ID ${deletedMeeting.host} not found.`);
    }

    // Respond with a success message
    res
      .status(200)
      .json({ message: "Meeting deleted successfully", deletedMeeting });
  } catch (error) {
    console.error("Error deleting meeting:", error.message);
    res
      .status(500)
      .json({ message: "Meeting deletion failed", error: error.message });
  }
});

//delete a booking
// When a booking is deleted, the seats available for the slot should be updated
// The booking should be removed from the user's list of reservations
// The booking should be removed from the slot's list of attendees and registered attendees
app.delete("/api/bookings/delete/:bookingID/:userID", async (req, res) => {
  const { bookingID, userID } = req.params;

  try {
    // Ensure bookingID and userID are provided
    if (!bookingID || !userID) {
      return res
        .status(400)
        .json({ message: "Booking ID and User ID are required" });
    }

    // Find the booking slot and populate necessary fields
    const booking = await MeetingSlot.findById(bookingID)
      .populate({
        path: "registeredAttendees.attendeeId", // Populate attendeeId inside registeredAttendees
        model: "User", // Refers to the User model
      })
      .populate({
        path: "meeting",
        populate: { path: "host" }, // Optionally populate meeting and host details if needed
      });

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    // Find the user
    const registeree = await User.findById(userID);
    if (!registeree) {
      return res.status(404).json({ message: "User not found" });
    }

    // Format the user's name
    const userName = `${registeree.firstName} ${registeree.lastName}`;

    // Remove the user from the list of attendees
    booking.attendees = booking.attendees.filter(
      (attendee) => attendee !== userName
    );

    // Find the booking to remove from the registered attendees list
    // Find the booking to remove from the registered attendees list
    const bookingToRemove = booking.registeredAttendees.find(
      (attendee) => attendee.attendeeId._id.toString() === userID
    );
    console.log("Booking to remove:", bookingToRemove);

    if (bookingToRemove) {
      // Update the available seats by adding back the number of seats the user booked
      booking.seatsAvailable += bookingToRemove.seatsBooked;

      console.log("Seats available:", booking.seatsAvailable);

      // Remove the booking from the registered attendees list
      booking.registeredAttendees = booking.registeredAttendees.filter(
        (attendee) => attendee.attendeeId._id.toString() !== userID
      );

      console.log("Registered attendees:", booking.registeredAttendees);
    }

    // Remove the booking from the user's list of reservations
    registeree.reservations = registeree.reservations.filter(
      (reservation) => reservation.toString() !== bookingID
    );

    // Save the updated user and booking slot
    await registeree.save();
    await booking.save();

    console.log("Successfully deleted booking");
    res.status(200).json({ message: "Booking deleted successfully" });
  } catch (error) {
    console.error("Error deleting booking:", error.message);
    res
      .status(500)
      .json({ message: "Booking deletion failed", error: error.message });
  }
});

// Serve the meeting slots fetch api route for a specific date and all slots
app.get("/api/allslots/:meetingID/:date", async (req, res) => {
  const { meetingID, date } = req.params;

  console.log("Meeting ID:", meetingID);
  console.log("Date:", date);

  try {
    if (!meetingID || !date) {
      return res.status(400).json({
        message: "Meeting ID and date are required",
      });
    }

    // Find the meeting and populate the meeting slots
    const meeting = await Meeting.findById(meetingID).populate("meetingSlots");

    if (!meeting) {
      return res.status(404).json({ message: "Meeting not found" });
    }

    // Get the possible slots from validSlots array
    const cmpDate = new Date(date).toISOString().split("T")[0];
    const cmpStartDate = new Date(meeting.startDate)
      .toISOString()
      .split("T")[0];
    const cmpEndDate = new Date(meeting.endDate).toISOString().split("T")[0];

    let possibleSlots = [];

    // Determine which slots to use based on the date
    if (cmpStartDate === cmpEndDate) {
      possibleSlots = meeting.validSlots[0];
    } else if (cmpDate === cmpStartDate) {
      possibleSlots = meeting.validSlots[0];
    } else if (cmpDate === cmpEndDate) {
      possibleSlots = meeting.validSlots[meeting.validSlots.length - 1];
    } else if (cmpDate > cmpStartDate && cmpDate < cmpEndDate) {
      const diff = Math.floor(
        (new Date(date).setHours(0, 0, 0, 0) -
          new Date(meeting.startDate).setHours(0, 0, 0, 0)) /
          (1000 * 60 * 60 * 24)
      );
      possibleSlots = meeting.validSlots[diff];
    } else {
      return res.status(400).json({ message: "Invalid date" });
    }

    // Get the booked slots for this date
    const bookedSlots = meeting.meetingSlots
      .filter(
        (slot) =>
          new Date(slot.occurrenceDate).toISOString().split("T")[0] === cmpDate
      )
      .map((slot) => ({
        time: new Date(slot.startTime).toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        }),
        seatsAvailable: slot.seatsAvailable,
        totalSeats: meeting.seatsPerSlot,
        attendees: slot.attendees,
      }));

    // Create a map of booked slots for easy lookup
    const bookedSlotsMap = new Map(
      bookedSlots.map((slot) => [slot.time, slot])
    );

    // Combine all slots with their booking status
    const allSlots = possibleSlots.map((slotTime) => {
      const bookedSlot = bookedSlotsMap.get(slotTime);
      return {
        time: slotTime,
        seatsAvailable: bookedSlot
          ? bookedSlot.seatsAvailable
          : meeting.seatsPerSlot,
        totalSeats: meeting.seatsPerSlot,
        attendees: bookedSlot ? bookedSlot.attendees : [],
        isBooked: !!bookedSlot,
      };
    });

    res.status(200).json({
      data: {
        date: cmpDate,
        slots: allSlots,
      },
    });
  } catch (error) {
    console.error("Error fetching slots:", error);
    res.status(500).json({
      message: "Failed to fetch slots",
      error: error.message,
    });
  }
});

// For all other routes, send back the index.html from the React app
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../client/dist", "index.html"));
});

app.listen(5000, () => {
  console.log("Server is running on port 5000");
});
