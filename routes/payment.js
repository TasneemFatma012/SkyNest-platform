const express = require("express");
const router = express.Router();
const crypto = require("crypto");
const razorpay = require("../utils/razorpay");
const Booking = require("../models/Booking");


// Create Order
router.post("/create-order", async (req, res) => {

  const { amount, listingId } = req.body;

  const options = {
    amount: amount * 100,
    currency: "INR",

    receipt: listingId.toString(),

    notes:{
      listingId: listingId
    }
  };


  const order = await razorpay.orders.create(options);

  res.json(order);

});



// Verify Payment
router.post("/verify", async (req, res)=>{

  const {
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
    listingId
  } = req.body;


  const body =
  razorpay_order_id + "|" + razorpay_payment_id;


  const expectedSignature =
  crypto
  .createHmac(
    "sha256",
    process.env.RAZORPAY_SECRET
  )
  .update(body)
  .digest("hex");



  if(expectedSignature === razorpay_signature){


    const booking = await Booking.create({

      user:req.user._id,

      listing:listingId,

      paymentId:razorpay_payment_id,

      orderId:razorpay_order_id,

      paymentStatus:"paid"

    });


    res.json({
      success:true,
      booking
    });


  }else{


    res.status(400).json({
      success:false,
      message:"Payment verification failed"
    });


  }


});


module.exports = router;