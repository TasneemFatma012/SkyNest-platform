const Listing = require("../models/listing");
const Booking = require("../models/Booking");
const Notification = require("../models/Notification");
const Review = require("../models/review");
const { Parser } = require("json2csv");
const PDFDocument = require("pdfkit");
const ExcelJS = require("exceljs");

module.exports.dashboard = async (req, res) => {
  try {

    const { search = "", sort = "", startDate, endDate } = req.query;

    // ============================================
    // HOST LISTINGS (with search)
    // ============================================
    const listingFilter = { owner: req.user._id };

    if (search.trim()) {
      listingFilter.title = { $regex: search.trim(), $options: "i" };
    }

    let listings = await Listing.find(listingFilter);

    const listingIds = listings.map(l => l._id);

    // ============================================
    // DATE RANGE FILTER (applies to bookings/revenue)
    // ============================================
    const bookingFilter = {
      listing: { $in: listingIds }
    };

    let start, end;

    if (startDate) start = new Date(startDate);

    if (endDate) {
      end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
    }

    if (start || end) {
      bookingFilter.checkIn = {};
      if (start) bookingFilter.checkIn.$gte = start;
      if (end) bookingFilter.checkIn.$lte = end;
    }

    // Host Bookings
    const bookings = await Booking.find(bookingFilter)
      .populate("listing")
      .populate("user")
      .sort({ createdAt: -1 });

    // Revenue
    const revenue = bookings
      .filter(b => b.status === "confirmed")
      .reduce((sum, b) => sum + b.amount, 0);

    const totalBookings = bookings.length;
    const totalListings = listings.length;

    const cancelledBookings =
      bookings.filter(b => b.status === "cancelled").length;

    const conversionRate =
      totalBookings === 0
        ? 0
        : Math.round(
            ((totalBookings - cancelledBookings) / totalBookings) * 100
          );

    // Revenue Per Listing
    const listingRevenue = {};

    listings.forEach(listing => {

      const data = bookings.filter(
        b =>
          b.listing &&
          b.listing._id.toString() === listing._id.toString()
      );

      listingRevenue[listing._id] = {

        bookings: data.length,

        revenue: data
          .filter(b => b.status === "confirmed")
          .reduce((sum, b) => sum + b.amount, 0)

      };

    });

    // ============================================
    // SORT LISTINGS (filter dropdown)
    // ============================================
    if (sort === "priceHigh") {
      listings = [...listings].sort((a, b) => b.price - a.price);
    } else if (sort === "priceLow") {
      listings = [...listings].sort((a, b) => a.price - b.price);
    } else if (sort === "mostBooked") {
      listings = [...listings].sort(
        (a, b) =>
          (listingRevenue[b._id]?.bookings || 0) -
          (listingRevenue[a._id]?.bookings || 0)
      );
    }

    // Calendar Events
    const calendarEvents = bookings.map(b => ({

      title: b.listing?.title || "Booking",

      start: b.checkIn,

      end: b.checkOut,

      color:
        b.status === "confirmed"
          ? "#16a34a"
          : "#dc2626"

    }));

    // Notifications
    const notifications =
      await Notification.find({
        user: req.user._id
      }).sort({ createdAt: -1 });

    // Recent Bookings
    const recentBookings =
      bookings.slice(0, 10);

    // ============================================
    // REVIEWS & AVERAGE RATING
    // ============================================
    let reviews = [];
    let averageRating = 0;

    try {

      reviews = await Review.find({
        listing: { $in: listingIds }
      })
        .populate("author")
        .populate("listing")
        .sort({ createdAt: -1 })
        .limit(6);

      const allReviews = await Review.find({
        listing: { $in: listingIds }
      });

      if (allReviews.length) {
        averageRating =
          Math.round(
            (allReviews.reduce((sum, r) => sum + r.rating, 0) /
              allReviews.length) *
              10
          ) / 10;
      }

    } catch (reviewErr) {
      console.log("Reviews unavailable:", reviewErr.message);
    }
    // ============================================
// CHART DATA (Last 6 Months)
// ============================================

const chartLabels = [];
const revenueChart = [0, 0, 0, 0, 0, 0];
const bookingChart = [0, 0, 0, 0, 0, 0];

const now = new Date();

// Labels
for (let i = 5; i >= 0; i--) {

  const d = new Date();

  d.setMonth(now.getMonth() - i);

  chartLabels.push(
    d.toLocaleString("en-IN", {
      month: "short"
    })
  );

}

// Revenue & Bookings
bookings.forEach((booking) => {

  if (booking.status !== "confirmed") return;

  const bookingDate = new Date(booking.checkIn);

  const diff =
    (now.getFullYear() - bookingDate.getFullYear()) * 12 +
    (now.getMonth() - bookingDate.getMonth());

  if (diff >= 0 && diff < 6) {

    const index = 5 - diff;

    revenueChart[index] += booking.amount;

    bookingChart[index]++;

  }
  

});

    res.render("host/dashboard", {

      listings,

      revenue,

      totalBookings,

      totalListings,

      cancelledBookings,

      conversionRate,

      listingRevenue,

      notifications,

      calendarEvents,

      recentBookings,

      reviews,

      averageRating,

      search,

      sort,

      startDate: startDate || "",

      endDate: endDate || "",
      chartLabels,
      revenueChart,
      bookingChart, 

    });

  } catch (err) {

    console.log(err);

    req.flash("error", "Dashboard Error");

    res.redirect("/");

  }
  
};



// ===================== CSV EXPORT =====================
module.exports.exportCSV = async (req, res) => {
  try {
    const listings = await Listing.find({ owner: req.user._id });
    const listingIds = listings.map(l => l._id);

    const bookings = await Booking.find({
      listing: { $in: listingIds }
    })
      .populate("listing", "title")
      .populate("user", "username")
      .sort({ createdAt: -1 });

    const data = bookings.map((b, i) => ({
      "S.No": i + 1,
      "Property": b.listing?.title || "-",
      "Guest": b.user?.username || "-",
      "Check In": b.checkIn?.toLocaleDateString("en-IN"),
      "Check Out": b.checkOut?.toLocaleDateString("en-IN"),
      "Amount": b.amount,
      "Status": b.status,
      "Created": b.createdAt?.toLocaleDateString("en-IN")
    }));

    const parser = new Parser();
    const csv = parser.parse(data);

    res.header("Content-Type", "text/csv");
    res.attachment("host-report.csv");

    return res.send(csv);

  } catch (err) {
    console.log(err);
    return res.redirect("/host/dashboard");
  }
};



// ===================== EXCEL EXPORT =====================
module.exports.exportExcel = async (req, res) => {
  try {
    const listings = await Listing.find({ owner: req.user._id });
    const listingIds = listings.map(l => l._id);

    const bookings = await Booking.find({
      listing: { $in: listingIds }
    })
      .populate("listing", "title")
      .populate("user", "username");

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Bookings");

    sheet.columns = [
      { header: "S.No", key: "sno", width: 8 },
      { header: "Property", key: "property", width: 30 },
      { header: "Guest", key: "guest", width: 20 },
      { header: "Check In", key: "checkin", width: 18 },
      { header: "Check Out", key: "checkout", width: 18 },
      { header: "Amount", key: "amount", width: 15 },
      { header: "Status", key: "status", width: 15 }
    ];

    bookings.forEach((b, i) => {
      sheet.addRow({
        sno: i + 1,
        property: b.listing?.title,
        guest: b.user?.username,
        checkin: b.checkIn?.toLocaleDateString("en-IN"),
        checkout: b.checkOut?.toLocaleDateString("en-IN"),
        amount: b.amount,
        status: b.status
      });
    });

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );

    res.setHeader(
      "Content-Disposition",
      "attachment; filename=host-report.xlsx"
    );

    await workbook.xlsx.write(res);
    return res.end();

  } catch (err) {
    console.log(err);
    return res.redirect("/host/dashboard");
  }
};



// ===================== PDF EXPORT =====================
module.exports.exportPDF = async (req, res) => {
  try {
    const listings = await Listing.find({ owner: req.user._id });
    const listingIds = listings.map(l => l._id);

    const bookings = await Booking.find({
      listing: { $in: listingIds }
    })
      .populate("listing", "title")
      .populate("user", "username");

    const doc = new PDFDocument({ margin: 40 });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=host-report.pdf"
    );

    doc.pipe(res);

    doc.fontSize(20).text("HOST BOOKING REPORT", { align: "center" });
    doc.moveDown();

    bookings.forEach((b, i) => {
      doc.fontSize(12).text(`Booking #${i + 1}`);
      doc.text(`Property: ${b.listing?.title || "-"}`);
      doc.text(`Guest: ${b.user?.username || "-"}`);
      doc.text(`Check In: ${b.checkIn?.toLocaleDateString("en-IN")}`);
      doc.text(`Check Out: ${b.checkOut?.toLocaleDateString("en-IN")}`);
      doc.text(`Amount: ₹${b.amount}`);
      doc.text(`Status: ${b.status}`);
      doc.moveDown();
    });

    doc.end();
    return;

  } catch (err) {
    console.log(err);
    return res.redirect("/host/dashboard");
  }
};