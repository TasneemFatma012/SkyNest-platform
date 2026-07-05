const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Review = require("./review.js");
const listingSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  description: String,
  category: {
    type: String,
    enum: [
      "Trending",
      "Rooms",
      "City",
      "Mountains",
      "Nature",
      "Beach",
      "Camping",
      "Homes",
      "Arctic",
      "Farms",
      "Skiing",
    ],
    default: "Trending",
    required: true,
  },
  image: {
    url: String,
    filename: String,
  },
  price: Number,
  location: String,
  country: String,
  geometry: {
  type: {
    type: String,
    enum: ["Point"],
    required: false,
  },
  coordinates: {
    type: [Number],
    required: false,
  },
},
  reviews: [
    {
      type: Schema.Types.ObjectId,
      ref: "Review",
    },
  ],
  owner: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
  views: {
   type:Number,
   default:0
  },
  blockedDates: [
   {
     type: Date
   }
  ],
  rating: {
  type: Number,
  default: 4.5
},
 
});

listingSchema.post("findOneAndDelete", async function (doc) {
  if (doc) {
  await Review.deleteMany({
    _id: {
      $in: doc.reviews,
    },
  });
}
});


const Listing = mongoose.model("Listing", listingSchema);
module.exports = Listing;
