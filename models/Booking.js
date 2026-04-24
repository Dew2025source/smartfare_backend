const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    from: {
      type: String,
      required: [true, 'Pickup location is required'],
    },
    to: {
      type: String,
      required: [true, 'Drop-off location is required'],
    },
    service: {
      type: String,
      required: [true, 'Service is required'],
      enum: ['Ola', 'Uber', 'Rapido'],
    },
    rideType: {
      type: String,
      required: [true, 'Ride type is required'],
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
    },
    distance: {
      type: Number,
      required: [true, 'Distance is required'],
    },
    date: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Booking', bookingSchema);
