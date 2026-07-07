const mongoose = require('mongoose');

const InventorySchema = new mongoose.Schema(
  {
    bloodBank: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    bloodType: { type: String, required: true },
    units: { type: Number, default: 0, min: 0 },
    metadata: { type: Object }
  },
  { timestamps: true }
);

InventorySchema.index({ bloodBank: 1, bloodType: 1 }, { unique: true });

module.exports = mongoose.model('Inventory', InventorySchema);


