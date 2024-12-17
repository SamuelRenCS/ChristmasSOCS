const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const MeetingSlotSchema = new Schema({
  meeting: {
    type: Schema.Types.ObjectId,
    ref: "Meeting",
  },
  occurrenceDate: { type: Date, required: true }, // The specific date of this occurrence
  startTime: Date,
  endTime: Date,
  //location: String,
  // Names of attendees
  attendees: [
    {
      type: String,
    },
  ],
  seatsAvailable: Number,
});

module.exports = mongoose.model("MeetingSlot", MeetingSlotSchema);
