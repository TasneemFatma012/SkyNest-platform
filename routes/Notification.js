const express = require("express");
const router = express.Router();
const Notification = require("../models/Notification");
const { isloggedIn } = require("../middleware");

// get notifications
router.get("/", isloggedIn, async (req, res) => {
  const notifications = await Notification.find({
    user: req.user._id
  }).sort({ createdAt: -1 });

  res.json(notifications);
});


router.post("/read/:id", isloggedIn, async (req, res) => {
  await Notification.findByIdAndUpdate(req.params.id, {
    isRead: true
  });

  res.json({ success: true });
});

// unread count
router.get("/unread-count", isloggedIn, async (req, res) => {
  const count = await Notification.countDocuments({
    user: req.user._id,
    isRead: false
  });

  res.json({ count });
});

module.exports = router;