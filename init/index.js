require("dotenv").config({ path: "../.env" });
const mongoose = require("mongoose");
const initData = require("./data.js");
const Listing = require("../models/listing.js");

const MONGO_URL = process.env.ATLASDB_URL;

main()
  .then(() => console.log("connected to DB"))
  .catch((err) => console.log(err));

async function main() {
  await mongoose.connect(MONGO_URL);
}

const initDB = async () => {
  await Listing.deleteMany({});

  // geometry aur owner dono add karo
  const data = initData.data.map((obj) => ({
    ...obj,
    owner: "69edbcc082d3fa898da75a59", // apna actual user _id yahan daalo
    geometry: {
      type: "Point",
      coordinates: [0, 0], // default coordinates (ya har listing ke liye real coordinates)
    },
  }));

  await Listing.insertMany(data);
  console.log("data was initialized");
};

initDB();