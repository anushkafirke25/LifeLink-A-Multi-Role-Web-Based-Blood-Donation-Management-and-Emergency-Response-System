// routes/bloodbank.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const bloodbankController = require('../controllers/bloodbankController');
const eventController = require('../controllers/eventController');
const auth = require('../middleware/auth');

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for image uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'event-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  // Accept only images
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// --- sanity checks (helps surface bad imports clearly) ---
if (typeof auth !== 'function') {
  throw new Error('middleware/auth.js must export a function (req,res,next).');
}
['list','create','getOne','update','remove'].forEach(fn => {
  if (typeof bloodbankController?.[fn] !== 'function') {
    throw new Error(`bloodbankController.${fn} must be a function.`);
  }
});

// probe
router.get('/test', (req, res) => res.json({ ok: true, scope: 'bloodbank' }));

// Frontend-expected endpoints (MUST come BEFORE /:id to avoid conflicts)
router.get('/dashboard', auth, bloodbankController.dashboard);
// GET /api/bloodbank/inventory -> returns ALL inventory records (for hospitals) - NO AUTH
router.get('/inventory', bloodbankController.getAllInventory);
// GET /api/bloodbank/hospital-requests -> returns ALL hospital requests - NO AUTH
router.get('/hospital-requests', bloodbankController.hospitalRequests);
// per-bloodbank inventory (me)
router.get('/inventory/me', auth, bloodbankController.inventory);
router.put('/inventory/:bloodType', auth, bloodbankController.updateInventory);
router.get('/pending-donors', auth, bloodbankController.pendingDonors);
// record/approve donation already mapped via approveDonation
router.post('/donation', auth, async (req, res, next) => {
  try {
    const Donation = require('../models/Donation');
    const bloodBankId = req.user?.id || req.headers['x-mock-user-id'];
    const { donorId, bloodType, units } = req.body;
    const donation = await Donation.create({ donor: donorId, bloodBank: bloodBankId, bloodType, units: units || 1, status: 'scheduled' });
    res.status(201).json({ message: 'donation scheduled', donation });
  } catch (e) { next(e); }
});
router.put('/donation/:donationId/approve', auth, bloodbankController.approveDonation);
router.put('/request/:requestId/process', auth, bloodbankController.processRequest);
router.get('/donations', auth, bloodbankController.recentDonations);
router.get('/donors/search', auth, bloodbankController.searchDonors);
router.post('/donations/record', auth, bloodbankController.recordDonation);
router.get('/eligible-donors', auth, bloodbankController.getEligibleDonors);
router.post('/send-reminder', auth, bloodbankController.sendReminder);
router.post('/schedule-appointment', auth, bloodbankController.scheduleAppointment);
router.get('/appointments', auth, bloodbankController.getAppointments);
router.get('/appointments/:donationId/mark-done', auth, bloodbankController.markDonationDone);

// Campaign/Event routes for bloodbanks
router.get('/campaigns/my-events', auth, eventController.getMyEvents);
router.post('/campaigns/create', auth, upload.single('image'), eventController.createEvent);
router.get('/campaigns/:eventId/registrations', auth, eventController.getEventRegistrations);
router.put('/campaigns/:id', auth, upload.single('image'), eventController.updateEvent);
router.delete('/campaigns/:id', auth, eventController.deleteEvent);
router.get('/campaigns/:eventId/export', auth, eventController.exportRegistrations);

// CRUD (MUST come AFTER specific routes to avoid /:id matching everything)
router.get('/', auth, bloodbankController.list);           // GET /api/bloodbank
router.post('/', auth, bloodbankController.create);        // POST /api/bloodbank
router.get('/:id', auth, bloodbankController.getOne);      // GET /api/bloodbank/:id
router.put('/:id', auth, bloodbankController.update);      // PUT /api/bloodbank/:id
router.delete('/:id', auth, bloodbankController.remove);   // DELETE /api/bloodbank/:id

module.exports = router;
