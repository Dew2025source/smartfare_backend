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
const { getRoadDistanceKm, getRoadDetails } = require('./utils/osrmService');
const { searchLocations, resolveLocation, normalizeCoord, reverseGeocode } = require('./utils/geocodingService');

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


// Geocode search: local SmartFare locations + OpenStreetMap/Nominatim places
app.get('/api/geocode/search', async (req, res) => {
  try {
    const q = req.query.q?.trim();
    const limit = Math.min(Number(req.query.limit) || 8, 10);

    if (!q || q.length < 2) {
      return res.json({ success: true, message: 'Type at least 2 characters.', data: { locations: [] } });
    }

    const locations = await searchLocations(q, limit);
    res.json({ success: true, message: 'Locations searched successfully.', data: { locations } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || 'Error searching locations.' });
  }
});


// Reverse geocode: browser current GPS coordinates -> readable area/place name
app.get('/api/geocode/reverse', async (req, res) => {
  try {
    const lat = Number(req.query.lat);
    const lng = Number(req.query.lng ?? req.query.lon);

    if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
      return res.status(400).json({ success: false, message: 'Valid lat and lng are required.' });
    }

    const location = await reverseGeocode(lat, lng);
    res.json({ success: true, message: 'Current location name found.', data: { location } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || 'Error finding current location name.' });
  }
});

// Coordinate-based route lookup: supports browser current location and arbitrary searched places
app.post('/api/route/coords', async (req, res) => {
  try {
    const from = req.body.from;
    const to = req.body.to;

    const fromLocation = normalizeCoord(from) ? await resolveLocation(from) : await resolveLocation(String(from || ''));
    const toLocation = normalizeCoord(to) ? await resolveLocation(to) : await resolveLocation(String(to || ''));

    if (fromLocation.lat === toLocation.lat && fromLocation.lng === toLocation.lng) {
      return res.status(400).json({ success: false, message: 'Pickup and drop-off cannot be the same location.' });
    }

    const routeDetails = await getRoadDetails(
      { lat: fromLocation.lat, lng: fromLocation.lng },
      { lat: toLocation.lat, lng: toLocation.lng }
    );
    const distance = routeDetails.distance;

    res.json({
      success: true,
      message: 'Route found.',
      data: {
        route: {
          from: fromLocation.name,
          to: toLocation.name,
          fromDisplayName: fromLocation.displayName,
          toDisplayName: toLocation.displayName,
          distance,
          source: 'osrm-coordinates',
          durationMinutes: routeDetails.durationMinutes,
          geometry: routeDetails.geometry,
          fromCoords: { lat: fromLocation.lat, lng: fromLocation.lng },
          toCoords: { lat: toLocation.lat, lng: toLocation.lng }
        }
      }
    });
  } catch (error) {
    const notFound = /not found|required|valid route/i.test(error.message || '');
    res.status(notFound ? 404 : 500).json({
      success: false,
      message: error.message || 'Error finding route from coordinates.'
    });
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