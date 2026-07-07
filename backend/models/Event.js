const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  hospital: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  bloodBank: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  creatorType: {
    type: String,
    enum: ['hospital', 'bloodbank'],
    required: true
  },
  eventDate: {
    type: Date,
    required: true
  },
  eventTime: {
    type: String,
    required: true
  },
  location: {
    type: String,
    required: true
  },
  contactInfo: {
    type: String,
    required: true
  },
  requirements: {
    type: String
  },
  imageUrl: {
    type: String
  },
  status: {
    type: String,
    enum: ['upcoming', 'ongoing', 'completed', 'cancelled'],
    default: 'upcoming'
  },
  registrationCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Index for efficient queries
eventSchema.index({ hospital: 1, eventDate: -1 });
eventSchema.index({ bloodBank: 1, eventDate: -1 });
eventSchema.index({ status: 1, eventDate: -1 });

module.exports = mongoose.model('Event', eventSchema);

