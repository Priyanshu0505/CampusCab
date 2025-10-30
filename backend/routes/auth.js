const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Import your models
const User = require('../models/User');
const Agency = require('../models/Agency');

// A secret key for your JWT tokens.
// In a real app, put this in a .env file!
const JWT_SECRET = 'your-super-secret-key'; 

/*
 * @route   POST /api/auth/register-user
 * @desc    Register a new user
 */
router.post('/register-user', async (req, res) => {
  try {
    const { username, email, password, phone } = req.body;

    // 1. Check if user already exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ msg: 'User already exists' });
    }

    // 2. Create new user instance
    user = new User({
      username,
      email,
      password,
      phone
    });

    // 3. Hash password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

    // 4. Save user to database
    await user.save();

    res.status(201).json({ msg: 'User registered successfully' });

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

/*
 * @route   POST /api/auth/login-user
 * @desc    Login a user and get a token
 */
router.post('/login-user', async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Check if user exists
    let user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

    // 2. Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

    // 3. Create JWT Token
    const payload = {
      user: {
        id: user.id, // This ID is what you'll use to identify the user
        role: 'user'
      }
    };

    jwt.sign(payload, JWT_SECRET, { expiresIn: '5h' }, (err, token) => {
      if (err) throw err;
      res.json({ token }); // Send the token to the client
    });

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});


/*
 * @route   POST /api/auth/register-agency
 * @desc    Register a new agency
 */
router.post('/register-agency', async (req, res) => {
  try {
    const { agencyName, email, password, address } = req.body;

    // 1. Check if agency exists
    let agency = await Agency.findOne({ email });
    if (agency) {
      return res.status(400).json({ msg: 'Agency already exists' });
    }

    // 2. Create new agency instance
    agency = new Agency({
      agencyName,
      email,
      password,
      address
    });

    // 3. Hash password
    const salt = await bcrypt.genSalt(10);
    agency.password = await bcrypt.hash(password, salt);

    // 4. Save agency to database
    await agency.save();

    res.status(201).json({ msg: 'Agency registered successfully' });

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

/*
 * @route   POST /api/auth/login-agency
 * @desc    Login an agency and get a token
 */
router.post('/login-agency', async (req, res) => {
    try {
        const { email, password } = req.body;

        // 1. Check if agency exists
        let agency = await Agency.findOne({ email });
        if (!agency) {
            return res.status(400).json({ msg: 'Invalid credentials' });
        }

        // 2. Compare password
        const isMatch = await bcrypt.compare(password, agency.password);
        if (!isMatch) {
            return res.status(400).json({ msg: 'Invalid credentials' });
        }

        // 3. Create JWT Token
        const payload = {
            user: {
                id: agency.id,
                role: 'agency'
            }
        };

        jwt.sign(payload, JWT_SECRET, { expiresIn: '5h' }, (err, token) => {
            if (err) throw err;
            res.json({ token });
        });

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});


module.exports = router;