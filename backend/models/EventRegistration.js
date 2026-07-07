const mongoose = require('mongoose');

const eventRegistrationSchema = new mongoose.Schema({
  event: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required: true
  },
  donor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true
  },
  phone: {
    type: String,
    required: true
  },
  bloodType: {
    type: String,
    required: true,
    enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
  },
  status: {
    type: String,
    enum: ['registered', 'confirmed', 'completed', 'cancelled'],
    default: 'registered'
  },
  notes: {
    type: String
  }
}, {
  timestamps: true
});

// Index for efficient queries
eventRegistrationSchema.index({ event: 1, createdAt: -1 });
eventRegistrationSchema.index({ donor: 1 });
eventRegistrationSchema.index({ email: 1 });

module.exports = mongoose.model('EventRegistration', eventRegistrationSchema);

