const Booking = require('../models/Booking');

// @route   POST /api/bookings/create
const createBooking = async (req, res) => {
  try {
    const { from, to, service, rideType, price, distance } = req.body;

    if (!from || !to || !service || !rideType || price == null || distance == null) {
      return res.status(400).json({
        success: false,
        message: 'All booking fields are required.',
      });
    }

    const booking = await Booking.create({
      userId: req.userId,
      from: from.trim(),
      to: to.trim(),
      service,
      rideType,
      price,
      distance,
    });

    return res.status(201).json({
      success: true,
      message: 'Booking confirmed successfully.',
      data: {
        booking,
        summary: {
          from: booking.from,
          to: booking.to,
          service: booking.service,
          rideType: booking.rideType,
          price: booking.price,
          distance: booking.distance,
        },
      },
    });
  } catch (error) {
    console.error('Create booking error:', error);
    return res.status(500).json({ success: false, message: 'Server error creating booking.' });
  }
};

// @route   GET /api/bookings/my
const getMyBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ userId: req.userId }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      message: 'Bookings fetched successfully.',
      data: { count: bookings.length, bookings },
    });
  } catch (error) {
    console.error('Get bookings error:', error);
    return res.status(500).json({ success: false, message: 'Server error fetching bookings.' });
  }
};

// @route   DELETE /api/bookings/:id
const deleteBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found.' });
    }

    if (booking.userId.toString() !== req.userId.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this booking.' });
    }

    await Booking.findByIdAndDelete(req.params.id);

    return res.status(200).json({
      success: true,
      message: 'Booking deleted successfully.',
      data: { deletedId: req.params.id },
    });
  } catch (error) {
    console.error('Delete booking error:', error);
    return res.status(500).json({ success: false, message: 'Server error deleting booking.' });
  }
};

module.exports = { createBooking, getMyBookings, deleteBooking };