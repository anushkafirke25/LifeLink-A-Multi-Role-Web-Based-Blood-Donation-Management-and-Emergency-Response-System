// models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 6 },
    role: { type: String, enum: ['donor', 'hospital', 'bloodbank', 'admin'], default: 'donor' },
    bloodType: { type: String, trim: true },
    phone: { type: String, trim: true },
    location: { type: String, trim: true },
    // Detailed address fields
    address: {
      street: { type: String, trim: true },
      area: { type: String, trim: true },
      city: { type: String, trim: true },
      state: { type: String, trim: true },
      pincode: { type: String, trim: true }
    },
    // Keep coordinates for future use if needed
    latitude: { type: Number },
    longitude: { type: Number },
    // Blood bank only: signature image as data URL (e.g. data:image/png;base64,...)
    signature: { type: String },
    // GeoJSON for real facilities / geolocation (optional; do not set default or 2dsphere will fail)
    geo: {
      type: { type: String, enum: ['Point'] },
      coordinates: { type: [Number] } // [longitude, latitude]
    }
  },
  { timestamps: true }
);

UserSchema.index({ geo: '2dsphere' }, { sparse: true });

// hash password before save
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// helper to compare passwords
UserSchema.methods.matchPassword = function (entered) {
  return bcrypt.compare(entered, this.password);
};

module.exports = mongoose.model('User', UserSchema);
