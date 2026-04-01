const express = require('express');
const router = express.Router();
const BloodRequest = require('../models/BloodRequest');
const Donor = require('../models/Donor');
const User = require('../models/User');
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

// Create a blood request (recipient only)
router.post('/', auth, async (req, res) => {
  try {
    if (req.user.role !== 'recipient') {
      return res.status(403).json({ message: 'Only recipients can create requests' });
    }

    const { donorId, hospitalName, patientName } = req.body;

    // Get donor details
    const donor = await Donor.findById(donorId);
    if (!donor) return res.status(404).json({ message: 'Donor not found' });

    // Get recipient user details
    const recipientUser = await User.findById(req.user.userId);
    if (!recipientUser) return res.status(404).json({ message: 'Recipient user not found' });

    const newRequest = new BloodRequest({
      recipientId: req.user.userId,
      donorId: donor._id,
      donorUserId: donor.userId,
      hospitalName,
      patientName,
      bloodGroup: donor.bloodGroup,
      recipientName: recipientUser.name,
      recipientPhone: recipientUser.phoneNumber
    });

    await newRequest.save();
    res.status(201).json(newRequest);
  } catch (error) {
    res.status(500).json({ message: 'Error creating request', error: error.message });
  }
});

// Get requests for the logged-in recipient
router.get('/my-requests', auth, async (req, res) => {
  try {
    if (req.user.role !== 'recipient') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const requests = await BloodRequest.find({ recipientId: req.user.userId })
      .populate('donorId', 'name bloodGroup area phoneNumber')
      .sort({ createdAt: -1 });

    res.status(200).json(requests);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching requests', error: error.message });
  }
});

// Get incoming requests for donor
router.get('/donor-requests', auth, async (req, res) => {
  try {
    if (req.user.role !== 'donor') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const requests = await BloodRequest.find({ donorUserId: req.user.userId })
      .populate('donorId', 'name bloodGroup area phoneNumber')
      .sort({ createdAt: -1 });

    res.status(200).json(requests);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching requests', error: error.message });
  }
});

// Accept or reject a request (donor only)
router.put('/:id/respond', auth, async (req, res) => {
  try {
    if (req.user.role !== 'donor') {
      return res.status(403).json({ message: 'Only donors can respond to requests' });
    }

    const { status } = req.body;
    if (!['accepted', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const request = await BloodRequest.findOneAndUpdate(
      { _id: req.params.id, donorUserId: req.user.userId },
      { status },
      { new: true }
    ).populate('donorId', 'name bloodGroup area phoneNumber');

    if (!request) return res.status(404).json({ message: 'Request not found' });

    res.status(200).json(request);
  } catch (error) {
    res.status(500).json({ message: 'Error responding to request', error: error.message });
  }
});

// Cancel a request (recipient only)
router.delete('/:id', auth, async (req, res) => {
  try {
    if (req.user.role !== 'recipient') {
      return res.status(403).json({ message: 'Only recipients can cancel requests' });
    }

    const request = await BloodRequest.findOneAndDelete({
      _id: req.params.id,
      recipientId: req.user.userId
    });

    if (!request) return res.status(404).json({ message: 'Request not found or not authorized' });

    res.status(200).json({ message: 'Request cancelled successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error cancelling request', error: error.message });
  }
});

module.exports = router;
