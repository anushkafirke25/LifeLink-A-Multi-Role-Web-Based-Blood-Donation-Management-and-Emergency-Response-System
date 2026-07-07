const mongoose = require('mongoose');

const DonationSchema = new mongoose.Schema(
  {
    donor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    bloodBank: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    bloodType: { type: String, required: true },
    units: { type: Number, default: 1, min: 1 },
    status: { type: String, enum: ['scheduled', 'completed', 'cancelled'], default: 'scheduled' },
    donationDate: { type: Date, default: Date.now },
    nextDonationDate: { type: Date }, // Scheduled next donation date (90 days from donation)
    appointmentDate: { type: Date }, // Scheduled appointment date for donation
    notes: { type: String },
    testResults: {
      hemoglobin: Number,
      bloodPressure: String,
      weight: Number,
      isPassed: Boolean
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Donation', DonationSchema);


