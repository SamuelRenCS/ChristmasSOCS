const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const MeetingSlotSchema = new Schema({
  meeting: {
    type: Schema.Types.ObjectId,
    ref: "Meeting",
  },
  occurrenceDate: { type: Date, required: true }, // The specific date of this occurrence
  startTime: { type: String, required: true },
  endTime: { type: String, required: true },
  
  attendees: [
    {
      type: String,
    },
  ],
  seatsAvailable: Number,

  registeredAttendees: [
    {
      attendeeId: {
        type: mongoose.Schema.Types.ObjectId, // Assuming you're using ObjectId for the attendee
        ref: "User", // Referring to the User model, if applicable
      },
      seatsBooked: {
        type: Number, // Number of seats they booked
        required: true,
      },
    },
  ],

});

module.exports = mongoose.model("MeetingSlot", MeetingSlotSchema);
