require("dotenv").config();

const mongoose  = require("mongoose");
const Listing   = require("./models/listing");
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");

const mapToken = process.env.MAP_TOKEN;
const geocoder = mbxGeocoding({ accessToken: mapToken });

const MONGO_URL = process.env.ATLASDB_URL;

if (!mapToken) {
  console.error("❌ MAP_TOKEN missing in .env");
  process.exit(1);
}

if (!MONGO_URL) {
  console.error("❌ ATLASDB_URL missing in .env");
  process.exit(1);
}

mongoose.connect(MONGO_URL)
  .then(() => console.log("✅ DB connected —", MONGO_URL.split("@")[1])) 
  .catch((err) => { console.error("DB error:", err); process.exit(1); });

async function fixListings() {

  const listings = await Listing.find({
    $or: [
      { geometry: { $exists: false } },
      { geometry: null },
      { "geometry.coordinates": { $exists: false } },
      { "geometry.coordinates": { $size: 0 } },
      { "geometry.coordinates": [0, 0] },       
    ]
  });

  console.log(`\n🔍 Found ${listings.length} listings with missing/broken geometry\n`);

  if (listings.length === 0) {
    console.log("✅ All listings already have valid coordinates!");
    mongoose.connection.close();
    return;
  }

  let fixed = 0;
  let failed = 0;

  for (let listing of listings) {
    try {
     
      const query = listing.location + ", " + listing.country;

      const response = await geocoder.forwardGeocode({
        query: query,
        limit: 1,
      }).send();

      if (response.body.features.length > 0) {
        listing.geometry = response.body.features[0].geometry;
        await listing.save();
        fixed++;
        console.log(
          "✅ Fixed:  " + listing.title +
          "  →  " + JSON.stringify(listing.geometry.coordinates)
        );
      } else {
        failed++;
        console.log("❌ No result for: " + query + "  [" + listing.title + "]");
      }

    } catch (err) {
      failed++;
      console.log("⚠️  Error on: " + listing.title + " — " + err.message);
    }
  }

  console.log("\n─────────────────────────────────");
  console.log("✅ Fixed:  " + fixed + " listings");
  console.log("❌ Failed: " + failed + " listings");
  console.log("─────────────────────────────────\n");

  mongoose.connection.close();
  console.log("🔒 DB connection closed.");
}

fixListings();