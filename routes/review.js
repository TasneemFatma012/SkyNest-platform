const express = require('express');
const router = express.Router({ mergeParams: true });
const wrapAsync = require("../utils/wrapAsync");
const Listing = require("../models/listing");
const Review = require("../models/review");
const { validateReview, isloggedIn } = require("../middleware");
const ExpressError = require("../utils/ExpressError");
const { listingSchema,reviewSchema } = require("../schema");
const reviewsController = require("../controllers/reviews");

// review
// post review route
router.post("/",isloggedIn, validateReview, wrapAsync(reviewsController.createReview));

// delete review route
router.delete("/:reviewId",isloggedIn, wrapAsync(reviewsController.deleteReview));
module.exports = router;