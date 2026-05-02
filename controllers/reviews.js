const Listing = require("../models/listing");
const Review = require("../models/review");
const ExpressError = require("../utils/ExpressError");

// Create a new review for a listing
module.exports.createReview = async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findById(id);
  if (!listing) {
    throw new ExpressError(404, "Listing not found");
  }
  const review = new Review(req.body.review);
  review.author = req.user._id; 
  console.log(req.body);
  listing.reviews.push(review);
  await review.save();
  await listing.save();
  req.flash("success", "Review added successfully!");
  res.redirect(`/listings/${id}`);
};

// Delete a review from a listing
module.exports.deleteReview = async (req, res) => {
  let { id, reviewId } = req.params;
  if (!id || !reviewId) {
    throw new ExpressError(400, "Invalid listing or review ID");
  }
  await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
  await Review.findByIdAndDelete(reviewId);
  req.flash("success", "Review deleted successfully!");
  res.redirect(`/listings/${id}`);
};  
