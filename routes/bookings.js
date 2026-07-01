const express = require("express");
const router = express.Router();
const Booking = require("../models/Booking");
const Listing = require("../models/listing");
const { isloggedIn } = require("../middleware");
const Notification = require("../models/Notification");

router.get("/my/bookings",isloggedIn, async (req, res) => {
  const bookings = await Booking.find({
    user: req.user._id,
  }).populate("listing");

  res.render("bookings/myBookings", { bookings });
});

router.post("/:id",isloggedIn, async (req, res) => {
  
  const checkIn = new Date(req.body.checkIn);
  const checkOut = new Date(req.body.checkOut);
   if (checkOut <= checkIn) {
  req.flash(
    "error",
    "Check-out date must be after check-in date"
  );
  return res.redirect("/bookings/" + req.params.id);
}

const existingBooking = await Booking.findOne({
  listing: req.params.id,
  checkIn: { $lte: checkOut },
  checkOut: { $gte: checkIn },
});

if (existingBooking) {
  req.flash(
    "error",
    "This property is already booked for selected dates!"
  );
  return res.redirect("/bookings/" + req.params.id);
}

  const nights =
    Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));

  const listing = await Listing.findById(req.params.id);

  const totalPrice = listing.price * nights;
  const booking = new Booking({
    listing: req.params.id,
    user: req.user._id,
    checkIn,
    checkOut,
    guests: req.body.guests,
    totalPrice,
  });

  

  await booking.save();
  await Notification.create({
  host: listing.owner,
  message: `New booking received for ${listing.title}`
  });
  console.log("Booking Saved:", booking);

  req.flash("success", "Booking Successful!");
  res.redirect("/bookings/my/bookings");
}); 




router.get("/:id",isloggedIn, async (req, res) => {
  const listing = await Listing.findById(req.params.id);

  res.render("bookings/booking", {
    listing,
  });
});

router.delete("/:bookingId", isloggedIn, async (req, res) => {
  await Booking.findByIdAndDelete(req.params.bookingId);

  req.flash("success", "Booking Cancelled");
  res.redirect("/bookings/my/bookings");
});







module.exports = router;