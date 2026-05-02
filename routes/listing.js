const express = require('express');
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync");
const Listing = require("../models/listing");
const { validateListing } = require("../middleware");
const ExpressError = require("../utils/ExpressError");
const { listingSchema,reviewSchema } = require("../schema");
const { isloggedIn,isOwner } = require("../middleware");  
const listingController = require("../controllers/listing");
const multer = require("multer");
const { storage } = require("../cloudConfig");

const upload = multer({ storage: storage});

//New Route
router.get("/new", isloggedIn,listingController.new);

//Edit Route
router.get("/:id/edit", isloggedIn,isOwner, wrapAsync(listingController.edit));

router.route("/")
.get(wrapAsync(listingController.index))
.post(isloggedIn,
    validateListing,
    upload.single("listing[image]"),
    wrapAsync(listingController.create));


router.route("/:id",)
.get(isloggedIn, wrapAsync(listingController.show))
.put(isloggedIn, isOwner, upload.single("listing[image]"), validateListing, wrapAsync(listingController.update))
.delete(isloggedIn, isOwner, wrapAsync(listingController.delete));



module.exports = router;