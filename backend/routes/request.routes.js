const express = require('express');
const router = express.Router();
const bloodRequestController = require('../controllers/request.controller');
const auth = require('../middleware/auth.middleware');

/**
 * Handle incoming and outgoing blood requests
 */
router.post('/', auth, bloodRequestController.createRequest);
router.get('/my-requests', auth, bloodRequestController.getMyRequests);
router.get('/donor-requests', auth, bloodRequestController.getDonorRequests);
router.put('/:id/respond', auth, bloodRequestController.respondToRequest);
router.delete('/:id', auth, bloodRequestController.cancelRequest);

module.exports = router;
