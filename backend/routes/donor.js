// routes/donor.js
const express = require('express');
const router = express.Router();

const donorController = require('../controllers/donorController');
const auth = require('../middleware/auth');

// --- sanity checks during debug ---
if (typeof auth !== 'function') {
  throw new Error('middleware/auth.js must export a function (req,res,next).');
}
['list','create','getOne','update','remove'].forEach(fn => {
  if (typeof donorController?.[fn] !== 'function') {
    throw new Error(`donorController.${fn} must be a function.`);
  }
});

// quick probe
router.get('/test', (req, res) => res.json({ ok: true, scope: 'donor' }));

// Frontend-expected endpoints (MUST come BEFORE /:id to avoid conflicts)
router.get('/dashboard', auth, donorController.dashboard);
router.get('/emergency-requests', auth, donorController.emergencyRequests);
router.get('/history', auth, donorController.history);
router.get('/achievements', auth, donorController.achievements);
router.get('/stats', auth, donorController.dashboard);
router.post('/respond/:requestId', auth, donorController.respond);
router.post('/schedule-donation', auth, donorController.scheduleDonation);
router.get('/notifications', auth, donorController.getNotifications);
router.put('/notifications/:notificationId/read', auth, donorController.markNotificationRead);
router.get('/nearby/bloodbanks', auth, donorController.getNearbyBloodBanks);
router.get('/nearby/hospitals', auth, donorController.getNearbyHospitals);

// CRUD (MUST come AFTER specific routes to avoid /:id matching everything)
router.get('/', auth, donorController.list);          // GET /api/donor
router.post('/', auth, donorController.create);       // POST /api/donor
router.get('/:id', auth, donorController.getOne);     // GET /api/donor/:id
router.put('/:id', auth, donorController.update);     // PUT /api/donor/:id
router.delete('/:id', auth, donorController.remove);  // DELETE /api/donor/:id

module.exports = router;
