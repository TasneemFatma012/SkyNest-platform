require("dotenv").config(); 
console.log(process.env.MAP_TOKEN); // Check if the token is loaded correctly

const mongoose = require("mongoose");
const Listing = require("./models/listing");
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");

const mapToken = process.env.MAP_TOKEN;
const geocoder = mbxGeocoding({ accessToken: mapToken });


mongoose.connect("mongodb://127.0.0.1:27017/wanderlust")
  .then(() => console.log("DB connected"));

async function fixListings() {
  const listings = await Listing.find({
    $or: [
      { geometry: { $exists: false } },
      { "geometry.coordinates": { $size: 0 } }
    ]
  });

  for (let listing of listings) {
    try {
      let response = await geocoder.forwardGeocode({
        query: listing.location,
        limit: 1,
      }).send();

      if (response.body.features.length) {
        listing.geometry = response.body.features[0].geometry;
        await listing.save();

        console.log("✅ Fixed:", listing.title);
      } else {
        console.log("❌ No result:", listing.title);
      }

    } catch (err) {
      console.log("Error:", listing.title);
    }
  }

  mongoose.connection.close();
}

fixListings();