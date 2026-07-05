const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const bookingSchema = new Schema({
  listing: {
    type: Schema.Types.ObjectId,
    ref: "Listing",
    required: true
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  checkIn: { type: Date, required: true },
  checkOut: { type: Date, required: true },
  guests: { type: Number, default: 1 },
  amount: { type: Number, required: true },
  paymentId: { type: String, required: true },
  orderId: { type: String, required: true },
  status: {
    type: String,
    enum: ["confirmed", "cancelled"],
    default: "confirmed"
  }
}, { timestamps: true });

module.exports = mongoose.model("Booking", bookingSchema);