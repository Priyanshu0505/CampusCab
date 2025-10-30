const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const Booking = require('../models/Booking');
const Vehicle = require('../models/Vehicle');
const mongoose = require('mongoose');

/*
 * @route   POST /api/bookings
 * @desc    Create a new booking
 * @access  Private (User only)
 */
router.post('/', auth, async (req, res) => {
  if (req.user.role !== 'user') {
    return res.status(403).json({ msg: 'Access denied: Not a user' });
  }
  try {
    const { vehicleId, startDate, endDate, totalPrice, agencyId, pickupTime } = req.body;
    const userId = req.user.id;
    const overlappingBooking = await Booking.findOne({
      vehicleId: vehicleId,
      $or: [
        { startDate: { $lte: endDate }, endDate: { $gte: startDate } }
      ]
    });
    if (overlappingBooking) {
      return res.status(400).json({ msg: 'Vehicle is not available for the selected dates' });
    }
    const newBooking = new Booking({
      userId,
      vehicleId,
      agencyId,
      startDate,
      endDate,
      pickupTime,
      totalPrice
    });
    const booking = await newBooking.save();
    res.status(201).json(booking);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

/*
 * @route   GET /api/bookings/my-bookings
 * @desc    Get all bookings for the logged-in user
 * @access  Private (User only)
 */
router.get('/my-bookings', auth, async (req, res) => {
  if (req.user.role !== 'user') {
    return res.status(403).json({ msg: 'Access denied: Not a user' });
  }
  try {
    const bookings = await Booking.find({ userId: req.user.id })
      .populate('vehicleId', 'modelName type pricePerDay')
      .populate('agencyId', 'agencyName');
    res.json(bookings);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

/*
 * @route   GET /api/bookings/agency-bookings
 * @desc    Get all bookings for the logged-in agency's vehicles
 * @access  Private (Agency only)
 */
router.get('/agency-bookings', auth, async (req, res) => {
  if (req.user.role !== 'agency') {
    return res.status(403).json({ msg: 'Access denied: Not an agency' });
  }
  try {
    const agencyVehicles = await Vehicle.find({ agencyId: req.user.id }).select('_id');
    const vehicleIds = agencyVehicles.map(v => v._id);
    const bookings = await Booking.find({ vehicleId: { $in: vehicleIds } })
      .populate('vehicleId', 'modelName type')
      .populate('userId', 'username email');
    res.json(bookings);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});


// --- UPDATED ROUTE ---
/*
 * @route   DELETE /api/bookings/:id
 * @desc    Delete a booking (by user or agency)
 * @access  Private
 */
router.delete('/:id', auth, async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id);

        if (!booking) {
            return res.status(404).json({ msg: 'Booking not found' });
        }

        // --- Safer ownership check ---
        let isUserOwner = false;
        if (booking.userId) {
            isUserOwner = booking.userId.toString() === req.user.id;
        }
        let isAgencyOwner = false;
        if (booking.agencyId) {
            isAgencyOwner = booking.agencyId.toString() === req.user.id;
        }
        if (!isUserOwner && !isAgencyOwner) {
            return res.status(401).json({ msg: 'User not authorized' });
        }

        // --- Permanently delete the booking ---
        await Booking.findByIdAndDelete(req.params.id);

        res.json({ msg: 'Booking removed' }); // Send back a success message

    } catch (err) {
        console.error('Delete booking error:', err.message);
        res.status(500).send('Server Error'); 
    }
});

module.exports = router;