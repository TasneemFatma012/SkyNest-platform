const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema({
  host: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  message: {
    type: String,
    required: true
  },

  isRead: {
    type: Boolean,
    default: false
  },

  createdAt: {
    type: Date,
    default: Date.now
  }
},
{ timestamps: true }
);

module.exports = mongoose.models.Notification ||mongoose.model("Notification", notificationSchema);