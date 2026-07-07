const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema(
  {
    donor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    bloodBank: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    type: { 
      type: String, 
      enum: ['reminder', 'appointment_scheduled', 'appointment_reminder'], 
      required: true 
    },
    message: { type: String, required: true },
    appointmentDate: { type: Date }, // For appointment-related notifications
    isRead: { type: Boolean, default: false },
    donationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Donation' } // Link to related donation if any
  },
  { timestamps: true }
);

module.exports = mongoose.model('Notification', NotificationSchema);

