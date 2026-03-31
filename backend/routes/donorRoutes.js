const express = require('express');
const router = express.Router();
const Donor = require('../models/Donor');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'secret123';

// Auth Middleware
const auth = (req, res, next) => {
  const token = req.header('Authorization');
  if (!token) return res.status(401).json({ message: 'No token, authorization denied' });
  try {
    const decoded = jwt.verify(token.replace('Bearer ', ''), JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};

// Search donors by area and/or blood group
router.get('/search', auth, async (req, res) => {
  try {
    const { area, bloodGroup } = req.query;
    let query = { isAvailable: true, city: { $regex: new RegExp('Hyderabad', 'i') } };

    if (area) query.area = { $regex: new RegExp(area, 'i') };
    if (bloodGroup) query.bloodGroup = bloodGroup;

    const donors = await Donor.find(query).sort({ createdAt: -1 });
    res.status(200).json(donors);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching donors', error: error.message });
  }
});

// Add a donor (donor role only)
router.post('/', auth, async (req, res) => {
  try {
    if (req.user.role !== 'donor') return res.status(403).json({ message: 'Not authorized' });

    const newDonor = new Donor({
      ...req.body,
      userId: req.user.userId
    });
    
    await newDonor.save();
    res.status(201).json(newDonor);
  } catch (error) {
    res.status(500).json({ message: 'Error adding donor', error: error.message });
  }
});

// Get logged-in user's donors
router.get('/me', auth, async (req, res) => {
  try {
    if (req.user.role !== 'donor') return res.status(403).json({ message: 'Not authorized' });

    const donors = await Donor.find({ userId: req.user.userId }).sort({ createdAt: -1 });
    res.status(200).json(donors);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching your donors', error: error.message });
  }
});

// Update specific donor availability
router.put('/:id/status', auth, async (req, res) => {
  try {
    const { isAvailable } = req.body;
    if (req.user.role !== 'donor') return res.status(403).json({ message: 'Not authorized' });

    const donor = await Donor.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.userId },
      { isAvailable },
      { new: true }
    );
    if (!donor) return res.status(404).json({ message: 'Donor not found' });
    
    res.status(200).json(donor);
  } catch (error) {
    res.status(500).json({ message: 'Error updating status', error: error.message });
  }
});

module.exports = router;
