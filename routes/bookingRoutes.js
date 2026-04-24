const express = require("express");
const router = express.Router();

const auth = require("../middleware/auth");
const {
  createBooking,
  getMyBookings,
  deleteBooking,
} = require("../controllers/bookingController");

const { getDistance } = require("../utils/getDistance");
const { calculateFares } = require("../utils/fareCalculator");

// Compare fares using live/fallback distance
router.post("/compare", async (req, res) => {
  try {
    const { from, to } = req.body;

    if (!from || !to) {
      return res.status(400).json({
        success: false,
        message: "From and To are required",
      });
    }

    const { distance, source } = await getDistance(from, to);
    const fares = calculateFares(distance);

    return res.json({
      success: true,
      from,
      to,
      distanceKm: distance,
      distanceSource: source,
      fares,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to compare fares",
    });
  }
});

// Existing protected booking routes
router.post("/create", auth, createBooking);
router.get("/my", auth, getMyBookings);
router.delete("/:id", auth, deleteBooking);

module.exports = router;
