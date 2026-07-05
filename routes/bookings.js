const express = require("express");
const router = express.Router();
const crypto = require("crypto");

const Booking = require("../models/Booking");
const Listing = require("../models/listing");
const Notification = require("../models/Notification");

const { isloggedIn } = require("../middleware");
const sendNotification = require("../utils/sendNotification");


// ─────────────────────────────
// MY BOOKINGS
// ─────────────────────────────
router.get("/my/bookings", isloggedIn, async (req, res) => {
  try {
    const bookings = await Booking.find({
      user: req.user._id,
      status: "confirmed",
    })
      .populate("listing")
      .populate("user", "username");

    res.render("bookings/myBookings", { bookings });
  } catch (error) {
    console.error(error);
    req.flash("error", "Something went wrong");
    res.redirect("/");
  }
});


// ─────────────────────────────
// CREATE BOOKING + PAYMENT VERIFY
// ─────────────────────────────
router.post("/:id", isloggedIn, async (req, res) => {
  try {
    const {
      checkIn: checkInRaw,
      checkOut: checkOutRaw,
      guests,
      razorpay_payment_id,
      razorpay_order_id,
      razorpay_signature,
    } = req.body;

    // Validation
    if (!checkInRaw || !checkOutRaw || !guests) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }

    // ── Payment verification ──
    const generatedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (generatedSignature !== razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: "Payment verification failed",
      });
    }

    const checkIn = new Date(checkInRaw);
    const checkOut = new Date(checkOutRaw);

    if (checkOut <= checkIn) {
      return res.status(400).json({
        success: false,
        message: "Invalid dates",
      });
    }

    // ── Overlap check ──
    const existingBooking = await Booking.findOne({
      listing: req.params.id,
      checkIn: { $lte: checkOut },
      checkOut: { $gte: checkIn },
    });

    if (existingBooking) {
      return res.status(400).json({
        success: false,
        message: "Already booked for these dates",
      });
    }

    const listing = await Listing.findById(req.params.id);

    if (!listing) {
      return res.status(404).json({
        success: false,
        message: "Listing not found",
      });
    }

    const nights = Math.ceil(
      (checkOut - checkIn) / (1000 * 60 * 60 * 24)
    );

    const totalPrice = listing.price * nights * guests;

    // ── Create booking ──
    const booking = await Booking.create({
      user: req.user._id,
      listing: req.params.id,
      checkIn,
      checkOut,
      guests: parseInt(guests),
      amount: totalPrice,
      paymentId: razorpay_payment_id,
      orderId: razorpay_order_id,
    });

    // ── Notification DB save ──
    await Notification.create({
      host: listing.owner,
      message: `New booking received for ${listing.title}`,
    });

    // ── SOCKET NOTIFICATION (FIXED) ──
    const io = req.app.get("io");
    const hostId = listing.owner.toString();

    await sendNotification(
      io,
      hostId,
      "🎉 New booking received!",
      "booking"
    );

    req.flash("success", "Booking Successful!");

    return res.status(200).json({
      success: true,
      bookingId: booking._id,
      redirectUrl: `/bookings/${booking._id}/confirmation`,
    });

  } catch (error) {
    console.error("Booking error:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});


// ─────────────────────────────
// BOOKING PAGE
// ─────────────────────────────
router.get("/:id", isloggedIn, async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);
    res.render("bookings/booking", { listing });
  } catch (error) {
    console.error(error);
    res.redirect("/listings");
  }
});


// ─────────────────────────────
// CONFIRMATION PAGE
// ─────────────────────────────
router.get("/:id/confirmation", isloggedIn, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id).populate(
      "listing"
    );

    if (!booking) {
      req.flash("error", "Booking not found");
      return res.redirect("/listings");
    }

    if (booking.user.toString() !== req.user._id.toString()) {
      req.flash("error", "Unauthorized access");
      return res.redirect("/bookings/my/bookings");
    }

    res.render("bookings/confirmation", { booking });
  } catch (error) {
    console.error(error);
    res.redirect("/listings");
  }
});


// ─────────────────────────────
// DELETE BOOKING
// ─────────────────────────────
router.delete("/:bookingId", isloggedIn, async (req, res) => {
  try {
    await Booking.findByIdAndDelete(req.params.bookingId);
    req.flash("success", "Booking Cancelled");
    res.redirect("/bookings/my/bookings");
  } catch (error) {
    console.error(error);
    res.redirect("/bookings/my/bookings");
  }
});

module.exports = router;