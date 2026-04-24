const path = require('path');
require('dotenv').config();
require('dotenv').config({ path: path.join(__dirname, '.env.local') });
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const { getAllLocations } = require('./utils/routeData');
const { getDistance } = require('./utils/getDistance');
const { calculateFares } = require('./utils/fareCalculator');

const app = express();

connectDB();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '../frontend')));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/bookings', bookingRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'SmartFare API is running.' });
});

// Locations
app.get('/api/locations', (req, res) => {
  try {
    const locations = getAllLocations();
    res.json({ success: true, message: 'Locations fetched successfully.', data: { locations } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching locations.' });
  }
});

// Route lookup
app.get('/api/route', async (req, res) => {
  try {
    const from = req.query.from?.trim();
    const to = req.query.to?.trim();

    if (!from || !to) {
      return res.status(400).json({
        success: false,
        message: 'Both "from" and "to" are required.'
      });
    }

    const result = await getDistance(from, to);

    res.json({
      success: true,
      message: 'Route found.',
      data: {
        route: {
          from,
          to,
          distance: result.distance,
          source: result.source,
        }
      }
    });
  } catch (error) {
    const notFound = /not found|unable to calculate/i.test(error.message || '');
    res.status(notFound ? 404 : 500).json({
      success: false,
      message: error.message || 'Error finding route.'
    });
  }
});

// Fare calculation
app.post('/api/fares/calculate', (req, res) => {
  try {
    const distance = Number(req.body.distance);

    if (!distance || distance <= 0) {
      return res.status(400).json({ success: false, message: 'A valid distance is required.' });
    }

    const fares = calculateFares(distance);
    res.json({ success: true, message: 'Fares calculated successfully.', data: { fares } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error calculating fares.' });
  }
});

// Frontend routes
const frontendPages = ['/', '/compare', '/results', '/login', '/signup', '/my-rides', '/contact'];
frontendPages.forEach((route) => {
  const file = route === '/' ? 'index' : route.slice(1);
  app.get(route, (req, res) => {
    res.sendFile(path.join(__dirname, `../frontend/${file}.html`));
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Endpoint not found.' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error.',
  });
});

/*const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 SmartFare server running on port ${PORT}`);
  console.log(`📱 Frontend: http://localhost:${PORT}`);
  console.log(`🔌 API: http://localhost:${PORT}/api`);
});*/
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 SmartFare server running on port ${PORT}`);
});