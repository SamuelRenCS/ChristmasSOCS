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
  users: [
    {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  seatsAvailable: Number,
});

modules.exports = mongoose.model("MeetingSlot", MeetingSlotSchema);
