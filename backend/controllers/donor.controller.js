const Donor = require('../models/Donor');

/**
 * Search donors based on location (area) and blood group
 * @route GET /api/donors/search
 */
exports.searchDonors = async (req, res) => {
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
};

/**
 * Register a new donor entry
 * @route POST /api/donors
 */
exports.addDonor = async (req, res) => {
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
};

/**
 * Get all donor listings for the current logged-in user
 * @route GET /api/donors/me
 */
exports.getMyDonors = async (req, res) => {
  try {
    if (req.user.role !== 'donor') return res.status(403).json({ message: 'Not authorized' });

    const donors = await Donor.find({ userId: req.user.userId }).sort({ createdAt: -1 });
    res.status(200).json(donors);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching your donors', error: error.message });
  }
};

/**
 * Update availability status for a specific donor listing
 * @route PUT /api/donors/:id/status
 */
exports.updateDonorStatus = async (req, res) => {
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
};
