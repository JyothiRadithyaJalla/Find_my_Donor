const BloodRequest = require('../models/BloodRequest');
const Donor = require('../models/Donor');
const User = require('../models/User');

/**
 * Recipient sends a new blood request to a donor
 * @route POST /api/requests
 */
exports.createRequest = async (req, res) => {
  try {
    if (req.user.role !== 'recipient') {
      return res.status(403).json({ message: 'Only recipients can create requests' });
    }

    const { donorId, hospitalName, patientName } = req.body;

    const donor = await Donor.findById(donorId);
    if (!donor) return res.status(404).json({ message: 'Donor not found' });

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
};

/**
 * Retrieve all blood requests sent by the current recipient
 * @route GET /api/requests/my-requests
 */
exports.getMyRequests = async (req, res) => {
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
};

/**
 * Retrieve all incoming blood requests for a donor
 * @route GET /api/requests/donor-requests
 */
exports.getDonorRequests = async (req, res) => {
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
};

/**
 * Donor responds (accept/reject) to a specific request
 * @route PUT /api/requests/:id/respond
 */
exports.respondToRequest = async (req, res) => {
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
};

/**
 * Recipient cancels a pending blood request
 * @route DELETE /api/requests/:id
 */
exports.cancelRequest = async (req, res) => {
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
};
