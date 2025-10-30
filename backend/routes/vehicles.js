const express = require('express');
const router = express.Router();
const { auth, isAgency } = require('../middleware/auth');
const Vehicle = require('../models/Vehicle');
const multer = require('multer');
const path = require('path');

// --- Multer Storage Configuration ---
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });
const uploadMiddleware = upload.single('image');

/*
 * @route   POST /api/vehicles
 * @desc    Add a new vehicle
 * @access  Private (Agency only)
 */
router.post('/', [auth, isAgency, uploadMiddleware], async (req, res) => {
  try {
    const { modelName, type, pricePerDay, description } = req.body;
    
    if (!req.file) {
      return res.status(400).json({ msg: 'Image file is required' });
    }
    const imageUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
    
    const newVehicle = new Vehicle({
      agencyId: req.user.id,
      modelName,
      type,
      pricePerDay,
      description,
      image: imageUrl
    });

    const vehicle = await newVehicle.save();
    res.status(201).json(vehicle);

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});


// --- UPDATED ROUTE ---
/*
 * @route   GET /api/vehicles
 * @desc    Get all vehicles (for search), with filters
 * @access  Public
 */
router.get('/', async (req, res) => {
  try {
    const { type } = req.query; // Get 'type' from the URL query

    // Start with an empty filter object
    let filter = {};

    // If a type is provided (and it's not 'All Types'), add it to the filter
    if (type && type !== "") {
      filter.type = type;
    }
    
    // We could add location filtering here too if we had it in the model
    // if (location) {
    //   filter.location = new RegExp(location, 'i'); // Case-insensitive search
    // }

    const vehicles = await Vehicle.find(filter).populate('agencyId', 'agencyName');
    res.json(vehicles);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});


// --- ROUTE ORDER FIX ---
/*
 * @route   GET /api/vehicles/my-vehicles
 * @desc    Get all vehicles for the logged-in agency
 * @access  Private (Agency only)
 */
router.get('/my-vehicles', [auth, isAgency], async (req, res) => {
    try {
        const vehicles = await Vehicle.find({ agencyId: req.user.id });
        res.json(vehicles);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});


/*
 * @route   GET /api/vehicles/:id
 * @desc    Get a single vehicle by its ID
 * @access  Public
 */
router.get('/:id', async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id).populate('agencyId', 'agencyName address');
    if (!vehicle) {
      return res.status(404).json({ msg: 'Vehicle not found' });
    }
    res.json(vehicle);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});


/*
 * @route   DELETE /api/vehicles/:id
 * @desc    Delete a vehicle
 * @access  Private (Agency only)
 */
router.delete('/:id', [auth, isAgency], async (req, res) => {
    try {
        const vehicle = await Vehicle.findById(req.params.id);

        if (!vehicle) {
            return res.status(404).json({ msg: 'Vehicle not found' });
        }

        if (vehicle.agencyId.toString() !== req.user.id) {
            return res.status(401).json({ msg: 'User not authorized' });
        }

        await Vehicle.findByIdAndDelete(req.params.id);

        res.json({ msg: 'Vehicle removed' });

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});


module.exports = router;