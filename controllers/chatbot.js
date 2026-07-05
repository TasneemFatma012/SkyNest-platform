const Listing = require("../models/listing");
const Booking = require("../models/Booking");
const { GoogleGenAI } = require("@google/genai");

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY
});

// ----------------------
// Helper Function
// ----------------------

function formatListings(listings) {

    return listings.map(l =>

`🏠 ${l.title}
📍 ${l.location}, ${l.country}
💰 ₹${l.price}/night
🏷️ ${l.category}`

    ).join("\n\n");

}

// ----------------------
// Controller
// ----------------------

module.exports.chat = async (req, res) => {

try{

const message=req.body.text.toLowerCase().trim();

let query={};

// ----------------------
// CATEGORY DETECTION
// ----------------------

const categoryMap={

beach:"Beach",
beaches:"Beach",

mountain:"Mountains",
mountains:"Mountains",

nature:"Nature",

camping:"Camping",

city:"City",
cities:"City",

home:"Homes",
homes:"Homes",

farm:"Farms",
farms:"Farms",

room:"Rooms",
rooms:"Rooms",

ski:"Skiing",
skiing:"Skiing",

arctic:"Arctic",

trending:"Trending"

};

for(const key in categoryMap){

if(message.includes(key)){

query.category=categoryMap[key];

break;

}

}

// ----------------------
// LOCATION DETECTION
// ----------------------

const locations=[

"goa",
"manali",
"shimla",
"himachal",
"gulmarg",
"srinagar",
"kashmir",
"coorg",
"munnar",
"udaipur",
"jaipur",
"kerala",
"phuket",
"bali",
"maldives",
"tokyo",
"dubai",
"miami",
"boston",
"malibu",
"cancun"

];

for(const loc of locations){

if(message.includes(loc)){

if(loc==="himachal"){

query.location=/manali|shimla/i;

}
else if(loc==="kerala"){

query.location=/munnar/i;

}
else if(loc==="kashmir"){

query.location=/gulmarg|srinagar/i;

}
else{

query.location=new RegExp(loc,"i");

}

break;

}

}

// ----------------------
// COUNTRY
// ----------------------

if(message.includes("india")){

query.country=/india/i;

}

// ----------------------
// BUDGET
// ----------------------

const amount=message.match(/\d+/);

if(amount){

query.price={

$lte:Number(amount[0])

};

}
// ----------------------
// MY BOOKINGS
// ----------------------

if (
    message.includes("my booking") ||
    message.includes("my bookings") ||
    message.includes("show bookings") ||
    message.includes("booking history")
) {

    if (!req.user) {
        return res.json({
            reply: "🔐 Please login to view your bookings."
        });
    }

    const bookings = await Booking.find({
        user: req.user._id
    }).populate("listing");

    if (!bookings.length) {
        return res.json({
            reply: "❌ You don't have any bookings yet."
        });
    }

    return res.json({
        reply: bookings.map(b =>

`🏨 ${b.listing.title}
📍 ${b.listing.location}, ${b.listing.country}
📅 ${new Date(b.checkIn).toLocaleDateString()} → ${new Date(b.checkOut).toLocaleDateString()}
💰 ₹${b.amount}
✅ ${b.status}`

        ).join("\n\n")
    });

}

// ----------------------
// CANCELLED BOOKINGS
// ----------------------

if (
    message.includes("cancelled booking") ||
    message.includes("cancelled bookings")
) {

    if (!req.user) {
        return res.json({
            reply: "🔐 Please login first."
        });
    }

    const cancelled = await Booking.find({
        user: req.user._id,
        status: "cancelled"
    }).populate("listing");

    if (!cancelled.length) {
        return res.json({
            reply: "❌ No cancelled bookings found."
        });
    }

    return res.json({
        reply: cancelled.map(b =>

`🏨 ${b.listing.title}
📍 ${b.listing.location}
📅 ${new Date(b.checkIn).toLocaleDateString()}
❌ Cancelled`

        ).join("\n\n")
    });

}

// ----------------------
// CHEAPEST
// ----------------------

if (
    message.includes("cheapest") ||
    message.includes("lowest price")
) {

    const cheapest = await Listing.findOne(query).sort({
        price: 1
    });

    if (!cheapest) {
        return res.json({
            reply: "No listing found."
        });
    }

    return res.json({
        reply:

`💰 Cheapest Stay

🏠 ${cheapest.title}
📍 ${cheapest.location}
₹${cheapest.price}/night`
    });

}

// ----------------------
// LUXURY
// ----------------------

if (
    message.includes("luxury")
) {

    const luxury = await Listing.findOne(query).sort({
        price: -1
    });

    if (!luxury) {
        return res.json({
            reply: "No luxury stay found."
        });
    }

    return res.json({
        reply:

`💎 Luxury Stay

🏠 ${luxury.title}
📍 ${luxury.location}
₹${luxury.price}/night`
    });

}

// ----------------------
// HIGHEST RATED
// ----------------------

if (
    message.includes("highest rating") ||
    message.includes("best rated") ||
    message.includes("top rated")
) {

    const best = await Listing.findOne(query).sort({
        rating: -1
    });

    if (!best) {
        return res.json({
            reply: "Rating data unavailable."
        });
    }

    return res.json({
        reply:

`⭐ Highest Rated Stay

🏠 ${best.title}
⭐ ${best.rating}
📍 ${best.location}
₹${best.price}/night`
    });

}

// ----------------------
// MOST VIEWED
// ----------------------

if (
    message.includes("popular") ||
    message.includes("most viewed")
) {

    const popular = await Listing.findOne(query).sort({
        views: -1
    });

    if (!popular) {
        return res.json({
            reply: "No listing found."
        });
    }

    return res.json({
        reply:

`🔥 Most Popular Stay

🏠 ${popular.title}
👀 ${popular.views} views
📍 ${popular.location}
₹${popular.price}/night`
    });

}

// ----------------------
// HONEYMOON
// ----------------------

if (
    message.includes("honeymoon") ||
    message.includes("romantic")
) {

    const honeymoon = await Listing.find({
        price: { $gte: 3000 }
    }).limit(3);

    return res.json({
        reply:
"❤️ Honeymoon Picks\n\n" +
formatListings(honeymoon)
    });

}

// ----------------------
// FAMILY
// ----------------------

if (
    message.includes("family")
) {

    const family = await Listing.find({
        category: {
            $in: ["Homes", "Nature", "Beach"]
        }
    }).limit(3);

    return res.json({
        reply:
"👨‍👩‍👧 Family Friendly Stays\n\n" +
formatListings(family)
    });

}

// ----------------------
// NORMAL SEARCH
// ----------------------

if (Object.keys(query).length) {

    const listings = await Listing.find(query).limit(5);

    if (listings.length) {

        return res.json({
            reply: formatListings(listings)
        });

    }

}

// ----------------------
// GEMINI
// ----------------------

const result = await ai.models.generateContent({

    model: "gemini-2.5-flash",

    contents: `

You are SkyNest AI.

Rules:

- Reply within 120 words.
- Use bullet points.
- Never ask unnecessary questions.
- Give direct answers.
- Help only with travel.

Question:

${message}

`

});

const reply =
result.candidates?.[0]?.content?.parts?.[0]?.text ||
"Sorry, I couldn't answer that.";

return res.json({
    reply
});

}

catch(err){

console.log(err);

return res.json({
reply:"⚠️ AI server unavailable."
});

}

};