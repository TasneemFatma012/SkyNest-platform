const Listing = require("../models/listing");
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
const mapToken = process.env.MAP_TOKEN;
const geocoder = mbxGeocoding({ accessToken: mapToken });

module.exports.index = async (req, res) => {
  console.log(req.query);
  const { category } = req.query;
  const categories = await Listing.distinct("category");
  console.log(categories);

  let allListings;

  if (category) {
    allListings = await Listing.find({ category });
    console.log("Category:", category);
    console.log("Found:", allListings.length);
  } else {
    allListings = await Listing.find({});
  }

  res.render("listings/index.ejs", {
    allListings,
    category,
    currUser: req.user,
  });
};

// New Route
module.exports.new = (req, res) => {
  res.render("listings/new.ejs");
}

// Show Route
module.exports.show = async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findById(id).populate({
    path: "reviews",
    populate: {
      path: "author"
    },
  })
  .populate("owner");
  if (!listing) {
    req.flash("error", "Listing not found");
    return res.redirect("/listings");
    // throw new ExpressError(404, "Listing not found");
  }
  listing.views = (listing.views || 0) + 1;
  await listing.save();
  res.render("listings/show.ejs", { listing });
};


// Create Route

module.exports.create = async (req, res) => {
  let response = await geocoder.forwardGeocode({
    query: req.body.listing.location,   // 🔥 dynamic location
    limit: 1,
  }).send();

  // ⚠️ safety check
  if (!response.body.features.length) {
    req.flash("error", "Invalid location");
    return res.redirect("/listings/new");
  }

  let url = req.file.path;
  let filename = req.file.filename;

  const newListing = new Listing(req.body.listing);

  newListing.owner = req.user._id;
  newListing.image = { url, filename };

 
  newListing.geometry = response.body.features[0].geometry;
  console.log(response.body.features);
  await newListing.save();

  req.flash("success", "Successfully created a new listing!");
  res.redirect("/listings");
};

// Edit Route
module.exports.edit = async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findById(id);
  if (!listing) {
    req.flash("error", "Listing not found");
    return res.redirect("/listings");
    
  }
  let originalImageUrl = listing.image.url;
  originalImageUrl = originalImageUrl.replace("/upload/", "/upload/w_250/");
  res.render("listings/edit.ejs", { listing, originalImageUrl });
};

// Update Route
module.exports.update = async (req, res) => {
  let { id } = req.params;
  // update
  let listing = await Listing.findByIdAndUpdate(id, { ...req.body.listing });
  if(typeof req.file !== "undefined"){
     let url = req.file.path;
     let filename = req.file.filename;
     listing.image = {url,filename};
     await listing.save();
    
    }

 

  req.flash("success", "Listing updated successfully!");
  res.redirect(`/listings/${id}`);
};


// Delete Route
module.exports.delete = async (req, res) => {
  let { id } = req.params;
  let deletedListing = await Listing.findByIdAndDelete(id);
  console.log(deletedListing);
  req.flash("success", "Listing deleted successfully!");
  res.redirect("/listings");
};