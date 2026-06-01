require("dotenv").config();
console.log(process.env.SECRET);
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const Listing = require("./models/listing.js");
const port = 8080;
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const wrapAsync = require("./utils/wrapAsync.js");
const ExpressError = require("./utils/ExpressError.js");
const Review = require("./models/review.js");
const {listingSchema,reviewSchema } = require("./schema.js");
const { validateListing, validateReview } = require("./middleware.js");
const listingRoutes = require("./routes/listing.js");
const reviewRoutes = require("./routes/review.js");
const userRoutes = require("./routes/user.js");
const chatRoutes = require("./routes/chat.js");
const session = require("express-session");
const MongoStore = require("connect-mongo").default;

const flash = require("connect-flash");
const { maxHeaderSize } = require("http");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");
const multer = require("multer");
const upload = multer({ dest: "uploads/" });
app.locals.MAP_TOKEN = process.env.MAP_TOKEN;

// startServer();

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride("_method"));
app.engine('ejs',ejsMate);
app.use(express.static(path.join(__dirname,"/public")));
app.use('/vendor/tabler-icons', express.static(path.join(__dirname, 'node_modules/@tabler/icons-webfont/dist')));
app.use('/vendor/fontawesome', express.static(path.join(__dirname, 'node_modules/@fortawesome/fontawesome-free')));

const dbUrl = process.env.ATLASDB_URL;

main() 
.then(() => {
    console.log("connected to DB");
})
.catch((err) => {
    console.log(err);
});

async function main(){
    await mongoose.connect(dbUrl);
  
}

const store = MongoStore.create({
  mongoUrl: process.env.ATLASDB_URL,
  crypto: {
    secret: process.env.SECRET
  },
  touchAfter: 24 * 3600
});

store.on("error",(err) => {
  console.log("ERROR IN MONGO SESSION STORE",err);
}); 

const sessionOptions = {
  store,
  secret: process.env.SECRET ,
  resave: false,
  saveUninitialized: true,
  cookie: { 
    expires: Date.now() + 1000 * 60 * 60 * 24 * 7, // 1 week
    maxAge: 1000 * 60 * 60 * 24 * 7, // 1 week
    httpOnly: true,
    secure: false }
};

app.use(session(sessionOptions));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req,res,next) => {
  res.locals.success = req.flash("success");
  console.log(res.locals.success);
  res.locals.error = req.flash("error");
  res.locals.currentUser = req.user || null;
  res.locals.currUser = req.user || null;
  next();
});

// Convenience redirects
app.get("/signup", (req, res) => {
  res.redirect("/users/signup");
});

app.get("/login", (req, res) => {
  res.redirect("/users/login");
});

app.use("/users", userRoutes);
app.use("/listings/:id/reviews", reviewRoutes);
app.use("/listings", listingRoutes);
app.use("/chat", chatRoutes);

app.get("/", (req, res) => {
  res.redirect("/listings");
});

app.use((req,res,next) => {
  next(new ExpressError(404,"Page Not Found"));
});

app.use((err,req,res,next) => {
  // let {statusCode , message} = err;
  let { statusCode = 500, message = "Something went wrong" } = err;
  res.status(statusCode).render("error.ejs",{message});
  // res.status(statusCode).send(message);
});

app.listen(port,() => {
    console.log(`server is listening to ${port}`);
});