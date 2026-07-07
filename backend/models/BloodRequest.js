const mongoose = require('mongoose');

const BloodRequestSchema = new mongoose.Schema(
  {
    hospital: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    bloodBank: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    bloodType: { type: String, required: true },
    units: { type: Number, required: true, min: 1 },
    fulfilledUnits: { type: Number },
    priority: { type: String, enum: ['critical', 'urgent', 'regular'], default: 'regular' },
    status: { type: String, enum: ['pending', 'approved', 'fulfilled'], default: 'pending' },
    notes: String,
    requiredBy: Date
  },
  { timestamps: true }
);

module.exports = mongoose.model('BloodRequest', BloodRequestSchema);


