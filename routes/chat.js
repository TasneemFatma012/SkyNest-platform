const express = require('express');
const router = express.Router();

function generateReply(message) {
  const normalized = message.trim().toLowerCase();
  if (!normalized) return "Hi there! Send me a message and I'll help you explore WanderLust.";
  if (/hello|hi|hey|greetings/.test(normalized)) {
    return "Hello! I'm your WanderLust assistant. Ask me about listings, booking tips, or travel ideas.";
  }
  if (/price|cost|budget|fee|tax/i.test(message)) {
    return "You can compare stay prices on the listings page. Taxes are added separately if a listing shows +18% GST.";
  }
  if (/farm|beach|city|mountain|nature|home|cabin|camp/i.test(message)) {
    return "Looking for a specific destination? Use the filter chips on the Explore page to browse Beach, Farms, City, Mountains, and more.";
  }
  if (/review|rating|host|owner/i.test(message)) {
    return "Reviews and host details are available on each listing's detail page. I can help you navigate to the right listing.";
  }
  return "Nice question! I can help you explore listings, find stays, and learn more about WanderLust. Try asking about Beach stays, Farms, or how to book a listing.";
}

router.get('/', (req, res) => {
  res.render('chat');
});

router.post('/message', express.json(), (req, res) => {
  const userText = String(req.body?.text || '').trim();
  if (!userText) {
    return res.status(400).json({ error: 'Please type a message before sending.' });
  }
  const reply = generateReply(userText);
  res.json({ reply });
});

module.exports = router;
