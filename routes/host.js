const express = require("express");
const router = express.Router();

const Listing = require("../models/listing.js");
const Booking = require("../models/Booking.js");
const Notification = require("../models/Notification");
const { isloggedIn, isHost } = require("../middleware.js");

router.get("/dashboard", isloggedIn, isHost, async (req, res) => {

  const listings = await Listing.find({
    owner: req.user._id
  });

  const listingIds = listings.map(l => l._id);

  const bookings = await Booking.find({
    listingId: { $in: listingIds }
  });

  let totalBookings = 0;
  let revenue = 0;
  let cancelledBookings = 0;

  const listingRevenue = {};

  bookings.forEach((b) => {

    if (b.status === "confirmed") {

      revenue += b.price || 0;
      totalBookings++;

      const id = b.listingId.toString();

      if (!listingRevenue[id]) {
        listingRevenue[id] = {
          bookings: 0,
          revenue: 0
        };
      }

      listingRevenue[id].bookings++;
      listingRevenue[id].revenue += b.price || 0;
    }

    if (b.status === "cancelled") {
      cancelledBookings++;
    }

  });

  // Conversion Rate
  let totalViews = 0;

  listings.forEach((listing) => {
    totalViews += listing.views || 0;
  });

  const conversionRate =
    totalViews === 0
      ? 0
      : ((totalBookings / totalViews) * 100).toFixed(1);
      const notifications = await Notification.find({
      host: req.user._id
  })
  .sort({ createdAt: -1 })
  .limit(10);    

  // Calendar Events
  const calendarEvents = [];

  // Blocked Dates
  listings.forEach((listing) => {

    if (listing.blockedDates) {

      listing.blockedDates.forEach((date) => {

        calendarEvents.push({
          title: `Blocked - ${listing.title}`,
          start: date,
          color: "#000000"
        });

      });

    }

  });

  // Booked Dates
  bookings.forEach((booking) => {

    if (booking.status === "confirmed") {

      calendarEvents.push({
        title: "Booked",
        start: booking.checkIn,
        end: booking.checkOut,
        color: "#dc3545"
      });

    }

  });

  console.log("Dashboard Hit");

  res.render("host/dashboard", {
    listings,
    totalListings: listings.length,
    totalBookings,
    revenue,
    cancelledBookings,
    listingRevenue,
    conversionRate,
    calendarEvents,
    notifications
  });

});

module.exports = router;