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
    required: true,
  },
  startDate: {
    type: Date,
    required: true,
  },
  endDate: {
    type: Date,
    required: true,
  },
  location: {
    type: String,
    required: true,
  },
  description: {
    type: String,
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
    enum: ["None", "Daily", "Weekly"],
    default: "None",
  },
  endRepeatDate: {
    type: Date, // When the repeating meetings end
  },
  repeatingDays: {
    // for weekly repeating meetings
    type: [Date],
  },
  meetingSlots: [
    {
      type: Schema.Types.ObjectId,
      ref: "MeetingSlot",
    },
  ],
});

module.exports = mongoose.model("Meeting", MeetingSchema);
