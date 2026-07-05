const express = require("express");
const router = express.Router();

const hostController = require("../controllers/host");
const { isloggedIn, isHost } = require("../middleware");

const Listing = require("../models/listing");
const BlockedDate = require("../models/blockDates");
const Booking = require("../models/Booking");

router.get(
  "/dashboard",
  isloggedIn,
  isHost,
  hostController.dashboard
);


router.post("/block-date", isloggedIn, isHost, async (req, res) => {

    try {

        let { listingId, start, end } = req.body;

        // Single-day block
        if (start === end) {
            const nextDay = new Date(start);
            nextDay.setDate(nextDay.getDate() + 1);
            end = nextDay;
        }

        await BlockedDate.create({

            hostId: req.user._id,
            listingId,
            start,
            end

        });

        res.json({ success: true });

    } catch (err) {

        console.log(err);

        res.json({
            success: false,
            message: "Unable to block dates."
        });

    }

});





router.get("/blocked-dates", isloggedIn, isHost, async (req, res) => {

    try {
        const listings = await Listing.find({
            owner: req.user._id
        });

        const listingIds = listings.map(l => l._id);

        // Blocked Dates
        const blocked = await BlockedDate.find({
            hostId: req.user._id
        }).populate("listingId");

        // Confirmed Bookings
        const bookings = await Booking.find({
            listing: { $in: listingIds },
            status: "confirmed"
        })
        .populate("listing")
        .populate("user", "username");

        let events = [];

        // 🔴 Blocked Dates
        blocked.forEach(b => {

            events.push({

                id: b._id,

                title: `🚫 ${b.listingId.title}`,

                start: b.start,

                end: b.end,

                backgroundColor: "#ef4444",

                borderColor: "#ef4444",

                textColor: "#fff",

                extendedProps: {

                    type: "blocked",

                    image: b.listingId.image?.url || "",

                    listing: b.listingId.title

                }

            });

        });

        // 🟢 Booked Dates
        bookings.forEach(b => {

            events.push({

                id: b._id,

                title: `✅ ${b.listing.title}`,

                start: b.checkIn,

                end: b.checkOut,

                backgroundColor: "#22c55e",

                borderColor: "#22c55e",

                textColor: "#fff",

                extendedProps: {

                    type: "booking",

                    image: b.listing.image?.url || "",

                    listing: b.listing.title,

                    guest: b.user?.username || "Guest",

                    amount: b.amount,

                    status: b.status

                }

            });

        });

        res.json(events);

    } catch (err) {

        console.log(err);

        res.status(500).json([]);

    }

});

router.delete("/block-date/:id", isloggedIn, isHost, async (req, res) => {

    try {

        await BlockedDate.findByIdAndDelete(req.params.id);

        res.json({
            success: true
        });

    } catch (err) {

        console.log(err);

        res.status(500).json({
            success: false,
            message: "Unable to unblock date."
        });

    }

});

router.get("/bookings", isloggedIn, isHost, async (req, res) => {
  try {

    const { filter } = req.query;

    const listings = await Listing.find({ owner: req.user._id });
    const listingIds = listings.map(l => l._id);

    let dateFilter = {};

    const now = new Date();

    if (filter === "today") {
      const start = new Date(now.setHours(0,0,0,0));
      const end = new Date(now.setHours(23,59,59,999));
      dateFilter = { checkIn: { $gte: start, $lte: end } };
    }

    if (filter === "month") {
      const start = new Date(now.getFullYear(), now.getMonth(), 1);
      const end = new Date(now.getFullYear(), now.getMonth()+1, 0);
      dateFilter = { checkIn: { $gte: start, $lte: end } };
    }

    if (filter === "year") {
      const start = new Date(now.getFullYear(), 0, 1);
      const end = new Date(now.getFullYear(), 11, 31);
      dateFilter = { checkIn: { $gte: start, $lte: end } };
    }

    

 const search = req.query.search || "";

let bookings = await Booking.find({
  listing: { $in: listingIds }
})
.populate("listing")
.populate("user");

if (search) {
  bookings = bookings.filter(b =>
    b.user?.username?.toLowerCase().includes(search.toLowerCase())
  );
}

    res.render("host/bookings", {
      bookings,
      filter: filter || "all",
      search: search || ""
    });

  } catch (err) {
    console.log(err);
    res.redirect("/");
  }
});

router.post("/booking/status/:id", isloggedIn, isHost, async (req, res) => {
  try {

    const { status } = req.body;

    await Booking.findByIdAndUpdate(req.params.id, {
      status
    });

    res.json({ success: true });

  } catch (err) {
    res.json({ success: false });
  }
});
router.get(
    "/export/csv",
    isloggedIn,
    isHost,
    hostController.exportCSV
);

router.get(
    "/export/excel",
    isloggedIn,
    isHost,
    hostController.exportExcel
);

router.get(
    "/export/pdf",
    isloggedIn,
    isHost,
    hostController.exportPDF
);
module.exports = router;