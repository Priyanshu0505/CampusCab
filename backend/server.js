const connectDB = require('./db');
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 3000;

// --- 1. Middleware ---
// These MUST come BEFORE your routes
app.use(cors()); // Allows cross-origin requests
app.use(express.json()); // Allows server to read JSON data

// ...
app.use(cors()); // Allows cross-origin requests
app.use(express.json()); // Allows server to read JSON data

// NEW LINE: Serve static files from the 'uploads' directory
app.use('/uploads', express.static('uploads'));

// --- 2. Routes ---
// Test route
app.get('/', (req, res) => {
  res.send('Welcome to the Vehicle Rental API!');
});

// API routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/vehicles', require('./routes/vehicles')); // The route we just added
app.use('/api/bookings', require('./routes/bookings'));

// --- 3. Start Server & DB ---
// Call connectDB
connectDB();

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});