const express = require("express");
const router = express.Router();
const razorpay = require("../utils/razorpay");

router.post("/create-order", async (req, res) => {

  const options = {
    amount: req.body.amount * 100,
    currency: "INR",
    receipt: "receipt_" + Date.now(),
  };

  const order = await razorpay.orders.create(options);

  res.json(order);
});

module.exports = router;