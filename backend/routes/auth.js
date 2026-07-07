// routes/auth.js (CommonJS)
const express = require('express');
const { register, login, getMe, updateProfile, changePassword } = require('../controllers/authController');
const router = express.Router();

// Optional sanity checks (temporarily)
// console.log('register type:', typeof register);
// console.log('login type:', typeof login);

router.post('/register', register); // must be a function
router.post('/login', login);
router.get('/me', getMe);
router.put('/profile', updateProfile);
router.put('/change-password', changePassword);

// Optional: simple GET to verify route file loads
router.get('/test', (req, res) => res.send('Auth OK'));

module.exports = router;
