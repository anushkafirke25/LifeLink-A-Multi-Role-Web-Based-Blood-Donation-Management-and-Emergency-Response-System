const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
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

// Public routes (no auth required)
router.get('/', eventController.getAllEvents);
router.get('/:id', eventController.getEvent);
router.post('/:eventId/register', eventController.registerForEvent);

// Hospital only routes (with auth)
router.get('/hospital/my-events', auth, eventController.getMyEvents);
router.post('/hospital/create', auth, upload.single('image'), eventController.createEvent);
router.put('/hospital/:id', auth, upload.single('image'), eventController.updateEvent);
router.delete('/hospital/:id', auth, eventController.deleteEvent);
router.get('/hospital/:eventId/registrations', auth, eventController.getEventRegistrations);
router.get('/hospital/:eventId/export', auth, eventController.exportRegistrations);

module.exports = router;

