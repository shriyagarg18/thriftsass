const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const dotenv = require("dotenv");
const path = require("path");
const session = require("express-session"); // <-- NEW: Import session middleware

dotenv.config();
const app = express();

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json()); // <-- NEW: Middleware to parse JSON bodies (for fetch)

// <-- NEW: Session middleware setup
// This must come BEFORE your routes
app.use(session({
    // Store this secret in your .env file
    secret: process.env.SESSION_SECRET || 'a-very-strong-fallback-secret', 
    resave: false,
    saveUninitialized: true,
    cookie: { 
        secure: false, // Set to true if your site is on HTTPS
        maxAge: 1000 * 60 * 60 * 24 // Optional: cookie expires in 1 day
    } 
}));

// Serve only asset folders explicitly so archived HTML in /html won't be served from root
app.use('/css', express.static(path.join(__dirname, '..', 'css')));
app.use('/scripts', express.static(path.join(__dirname, '..', 'scripts')));
app.use('/assets', express.static(path.join(__dirname, '..', 'assets')));
app.use('/node_modules', express.static(path.join(__dirname, '..', 'node_modules')));

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch(err => console.log("❌ DB connection failed:", err));

// Routes
const productRoutes = require("./routes/productRoutes");
const pageRoutes = require("./routes/pageRoutes"); // This file will handle all your cart routes

// API routes
app.use("/api/products", productRoutes);

// Page routes (serve frontend pages)
// Session middleware is now active for all routes in pageRoutes
app.use("/", pageRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));