const express = require('express');
const router = express.Router();
const donorController = require('../controllers/donor.controller');
const auth = require('../middleware/auth.middleware');

/**
 * Routes for searching and managing donors
 */
router.get('/search', auth, donorController.searchDonors);
router.post('/', auth, donorController.addDonor);
router.get('/me', auth, donorController.getMyDonors);
router.put('/:id/status', auth, donorController.updateDonorStatus);

module.exports = router;
