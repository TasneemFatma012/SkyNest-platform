const mongoose = require("mongoose");

const blockedDateSchema = new mongoose.Schema({
  hostId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },
  listingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Listing"
  },

 
  start: Date,
  end: Date,
  reason: String
});

module.exports = mongoose.model("blockDates", blockedDateSchema);