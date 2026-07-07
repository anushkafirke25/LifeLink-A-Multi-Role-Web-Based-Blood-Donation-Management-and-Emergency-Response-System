const mongoose = require('mongoose');

const DonorResponseSchema = new mongoose.Schema(
  {
    request: { type: mongoose.Schema.Types.ObjectId, ref: 'BloodRequest', required: true },
    donor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    availableDate: { type: Date, required: true },
    availableTime: { type: String, required: true },
    message: { type: String },
    status: { 
      type: String, 
      enum: ['pending', 'accepted', 'rejected', 'completed'], 
      default: 'pending' 
    }
  },
  { timestamps: true }
);

// Index to prevent duplicate responses
DonorResponseSchema.index({ request: 1, donor: 1 }, { unique: true });

module.exports = mongoose.model('DonorResponse', DonorResponseSchema);

