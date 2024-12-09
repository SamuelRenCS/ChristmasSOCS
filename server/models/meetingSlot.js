const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const MeetingSlotSchema = new Schema({
  meeting: {
    type: Schema.Types.ObjectId,
    ref: "Meeting",
  },
  maxUsers: {
    type: Number,
    required: true,
  },
  users: [
    {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  ],
});
