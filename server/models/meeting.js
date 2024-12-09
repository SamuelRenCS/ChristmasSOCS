const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const MeetingSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  host: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
  date: {
    type: Date,
    required: true,
  },
  startTime: {
    type: Date,
    required: true,
  },
  endTime: {
    type: Date,
    required: true,
  },
  location: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  interval: {
    type: Number,
    required: true,
  },
  seatsPerSlot: {
    type: Number,
    required: true,
  },
  repeat: {
    type: String,
    enum: ["none", "daily", "weekly", "monthly", "yearly"],
    default: "none",
  },
  endDate: {
    type: Date, // When the repeating meetings end
  },
  daysOfWeek: {
    type: [String], // Days of the week for repeating meetings
    enum: [
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
      "Sunday",
    ],
    validate: {
      validator: function (days) {
        return this.repeat === "weekly" ? days.length > 0 : days.length === 0;
      },
      message: "daysOfWeek can only be set for weekly repeating meetings.",
    },
  },
  meetingSlots: [
    {
      type: Schema.Types.ObjectId,
      ref: "MeetingSlot",
    },
  ],
});

module.exports = mongoose.model("Meeting", MeetingSchema);
