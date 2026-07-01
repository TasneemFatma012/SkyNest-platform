const express = require("express");
const router = express.Router();
const Wishlist = require("../models/wishlist");
const { isloggedIn } = require("../middleware");

router.post("/:id", isloggedIn, async (req, res) => {
  await Wishlist.create({
    user: req.user._id,
    listing: req.params.id,
  });

  req.flash("success", "Added to Wishlist");
  res.redirect("/wishlist");
});

router.get("/", isloggedIn, async (req, res) => {

  console.log("Wishlist page hit");
  const items = await Wishlist.find({
    user: req.user._id,
  }).populate("listing");

   console.log(items);

  res.render("wishlist/index", { items });
});

router.delete("/:id", isloggedIn, async (req, res) => {
  await Wishlist.findByIdAndDelete(req.params.id);

  req.flash("success", "Removed from Wishlist");
  res.redirect("/wishlist");
});



module.exports = router;