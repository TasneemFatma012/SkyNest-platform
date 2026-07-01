const ExpressError = require("./utils/ExpressError.js");
const {listingSchema, reviewSchema} = require("./schema.js");
// const Listing = require("./models/listing.js");

const validateListing = (req,res,next) => {
  let {error} = listingSchema.validate(req.body);
  if(error){
    let msg = error.details.map(el => el.message).join(",");
    throw new ExpressError(400,msg);
  } else {
    next();
  }
};

const validateReview = (req,res,next) => {
  let {error} = reviewSchema.validate(req.body);
  if(error){
    let msg = error.details.map(el => el.message).join(",");
    throw new ExpressError(400,msg);
  } else {    
    next();
  }
};

module.exports = { validateListing, validateReview };

const Listing = require("./models/listing");

module.exports.isloggedIn = (req,res,next) => {
  if(!req.isAuthenticated()){
    req.session.redirectUrl = req.originalUrl;
    req.flash("error", "You must be signed in to create a listing!");
    return res.redirect("/users/login");
  }
  next();
};  
module.exports.savedRedirectUrl = (req,res,next) => {
  if(req.session.redirectUrl){
    res.locals.redirectUrl = req.session.redirectUrl;
  }
  next();
};

module.exports.isOwner = async (req, res, next) => {
  let { id } = req.params;

  const listing = await Listing.findById(id);

  // check listing exists
  if (!listing) {
    req.flash("error", "Listing not found");
    return res.redirect("/listings");
  }

  // ownership check
  if (!listing.owner.equals(req.user._id)) {
    req.flash("error", "You are not the owner!");
    return res.redirect(`/listings/${id}`);
  }

  next();
};


module.exports.isHost =(req, res, next) => {
  if (!req.user || req.user.role !== "host") {
    return res.status(403).send("Only hosts allowed");
  }
  next();
}