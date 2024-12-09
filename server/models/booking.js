const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const BookingSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
  meeting: {
    type: Schema.Types.ObjectId,
    ref: "Meeting",
  },
  date: {
    type: Date,
    required: true,
  },
});
