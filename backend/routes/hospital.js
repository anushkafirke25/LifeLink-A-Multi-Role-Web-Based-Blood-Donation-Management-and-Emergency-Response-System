const express = require('express');
const router = express.Router();

const hospitalController = require('../controllers/hospitalController');
const auth = require('../middleware/auth');

// --- sanity checks during debug (keeps crashes obvious & readable) ---
if (typeof auth !== 'function') {
  throw new Error('middleware/auth.js must export a function (req,res,next).');
}
['list','create','getOne','update','remove'].forEach(fn => {
  if (typeof hospitalController?.[fn] !== 'function') {
    throw new Error(`hospitalController.${fn} must be a function.`);
  }
});

// probe route to confirm file loads
router.get('/test', (req, res) => res.json({ ok: true, scope: 'hospital' }));

// Frontend-expected endpoints (MUST come BEFORE /:id routes to avoid conflicts)
router.get('/dashboard', auth, hospitalController.dashboard);
router.post('/request', auth, hospitalController.createRequest);
router.get('/requests/debug', hospitalController.debugRequests); // Debug endpoint (before /requests)
router.get('/requests', auth, hospitalController.getRequests); // MUST be before /:id
router.get('/inventory', auth, hospitalController.inventory);
router.get('/stats', auth, hospitalController.stats);
router.get('/donations', auth, hospitalController.recentDonations);

// CRUD routes (MUST come AFTER specific routes to avoid conflicts)
router.get('/', auth, hospitalController.list);           // GET /api/hospital
router.post('/', auth, hospitalController.create);        // POST /api/hospital
router.get('/:id', auth, hospitalController.getOne);      // GET /api/hospital/:id (this was catching /requests!)
router.put('/:id', auth, hospitalController.update);      // PUT /api/hospital/:id
router.delete('/:id', auth, hospitalController.remove);   // DELETE /api/hospital/:id

module.exports = router;
