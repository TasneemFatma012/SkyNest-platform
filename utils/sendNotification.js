const Notification = require("../models/Notification");

async function sendNotification(io, userId, message, type = "system") {
  try {

    
    const notification = await Notification.create({
      user: userId,
      message,
      type
    });

    
    io.to(userId.toString()).emit("notification", notification);

    return notification;

  } catch (err) {
    console.log("Notification Error:", err.message);
  }
}

module.exports = sendNotification;