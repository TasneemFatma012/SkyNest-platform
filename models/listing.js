const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Review = require("./review.js");
const listingSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  description: String,
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
