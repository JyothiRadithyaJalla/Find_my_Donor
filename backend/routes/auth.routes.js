const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');

/**
 * Handle user registration and authentication
 */
router.post('/register', authController.registerUser);  
router.post('/login', authController.loginUser);

module.exports = router;
