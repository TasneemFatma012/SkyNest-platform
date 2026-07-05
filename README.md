# 🏡 SkyNest

> **Book Smart. Stay Anywhere.**

SkyNest is a modern full-stack vacation rental and property booking platform that connects travelers with unique accommodations while providing hosts with powerful tools to manage properties, bookings, revenue, and guest interactions.

Designed with a clean, responsive interface and built using modern web technologies, SkyNest delivers a seamless booking experience for guests and a comprehensive management dashboard for hosts.

---

# ✨ Features

## 👤 User Authentication

* Secure Sign Up & Login
* Passport.js Authentication
* Session Management
* Role-Based Access (Guest & Host)

## 🏠 Property Management

* Create, Update & Delete Listings
* Upload Property Images
* Interactive Location Maps
* Property Search & Filtering
* Responsive Listing Cards

## 📅 Booking System

* Secure Property Booking
* Real-Time Availability Check
* Booking History
* Booking Status Tracking
* Calendar-Based Reservation Management

## 🏡 Host Dashboard

* Listing Management
* Booking Management
* Revenue Analytics
* Monthly Booking Analytics
* Interactive Calendar
* Block & Unblock Dates
* Booking Reports
* Guest Reviews Overview

## 📊 Analytics

* Monthly Revenue Chart
* Monthly Booking Statistics
* Revenue Per Property
* Total Revenue
* Total Listings
* Conversion Rate
* Booking Status Analytics

## 🔔 Real-Time Notifications

* Socket.IO Integration
* Instant Booking Alerts
* Payment Notifications
* Unread Notification Badge
* Notification History

## ❤️ Wishlist

* Save Favourite Properties
* Personalized Wishlist

## ⭐ Reviews & Ratings

* Property Reviews
* Star Ratings
* Average Rating Calculation
* Recent Reviews

## 💳 Secure Payments

* Online Payment Integration
* Payment Verification
* Booking Confirmation

## 📁 Export Reports

* CSV Export
* Excel Export (.xlsx)
* PDF Export

---

# 🛠 Tech Stack

### Frontend

* HTML5
* CSS3
* Bootstrap 5
* JavaScript (ES6)
* EJS
* Chart.js
* FullCalendar

### Backend

* Node.js
* Express.js
* MongoDB
* Mongoose

### Authentication

* Passport.js
* Express Session
* Connect-Mongo

### Real-Time Communication

* Socket.IO

### File Upload

* Multer
* Cloudinary

### Report Generation

* JSON2CSV
* ExcelJS
* PDFKit

---

# 📂 Project Structure

```text
SkyNest/
│
├── controllers/
├── middleware/
├── models/
├── public/
│   ├── css/
│   ├── js/
│   ├── images/
│   └── uploads/
├── routes/
├── utils/
├── views/
├── app.js
├── package.json
└── README.md
```

---

# 🚀 Installation

Clone the repository:

```bash
git clone https://github.com/TasneemFatma012/Roamio-platform.git
```

Navigate to the project:

```bash
cd SkyNest
```

Install dependencies:

```bash
npm install
```

Create a `.env` file and configure:

```env
ATLASDB_URL=your_mongodb_connection_string
SECRET=your_session_secret
MAP_TOKEN=your_mapbox_token

CLOUD_NAME=your_cloudinary_name
CLOUD_API_KEY=your_cloudinary_api_key
CLOUD_API_SECRET=your_cloudinary_api_secret
```

Run the project:

```bash
npm start
```

or

```bash
nodemon app.js
```

Open your browser:

```text
http://localhost:8080
```

---

# 📸 Application Modules

* Authentication
* Property Listings
* Property Search
* Booking Management
* Host Dashboard
* Revenue Analytics
* Interactive Calendar
* Wishlist
* Reviews & Ratings
* Online Payments
* Notification System
* CSV / Excel / PDF Reports

---

# 🔮 Future Enhancements

* AI Property Recommendation
* Email Notifications
* Push Notifications
* Admin Dashboard
* Multi-language Support
* Mobile Application
* Live Chat Between Host & Guest
* Dynamic Pricing System

---

# 🤝 Contributing

Contributions are welcome!

1. Fork the repository
2. Create a new feature branch
3. Commit your changes
4. Push to your branch
5. Create a Pull Request

---

# 📄 License

This project is intended for educational and portfolio purposes.

---

# 👨‍💻 Developer

**Tasneem Fatma**

Built with ❤️ using Node.js, Express.js, MongoDB, and modern web technologies.
