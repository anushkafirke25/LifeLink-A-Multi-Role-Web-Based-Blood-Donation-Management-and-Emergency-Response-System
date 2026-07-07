// controllers/authController.js
const User = require('../models/User');

const register = async (req, res, next) => {
  try {
    const { name, email, password, role, bloodType, phone, location, latitude, longitude, address, signature } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required' });
    }
    const exists = await User.findOne({ email });
    if (exists) return res.status(409).json({ message: 'Email already registered' });

    const user = await User.create({ 
      name, 
      email, 
      password, 
      role, 
      bloodType, 
      phone, 
      location: location,
      latitude: latitude ? parseFloat(latitude) : undefined,
      longitude: longitude ? parseFloat(longitude) : undefined,
      address: address ? {
        street: address.street,
        area: address.area,
        city: address.city,
        state: address.state,
        pincode: address.pincode
      } : undefined,
      signature: role === 'bloodbank' ? signature : undefined
    });
    res.status(201).json({
      message: 'User registered successfully',
      user: { 
        id: user._id.toString(), 
        name: user.name, 
        email: user.email, 
        role: user.role,
        bloodType: user.bloodType,
        phone: user.phone,
        location: user.location,
        latitude: user.latitude,
        longitude: user.longitude,
        address: user.address,
        signature: user.signature
      }
    });
  } catch (err) { next(err); }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ message: 'Email and password are required' });

    const user = await User.findOne({ email });
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Simplified: return only user object (no JWT token)
    res.json({
      message: 'Login successful',
      user: { 
        id: user._id.toString(), 
        email: user.email, 
        role: user.role,
        name: user.name,
        bloodType: user.bloodType,
        phone: user.phone,
        location: user.location,
        latitude: user.latitude,
        longitude: user.longitude,
        address: user.address,
        signature: user.signature
      }
    });
  } catch (err) { next(err); }
};

module.exports = { register, login };

// Additional endpoints expected by frontend
const getMe = async (req, res, next) => {
  try {
    const userId = req.user?.id || req.headers['x-mock-user-id'];
    if (!userId) return res.status(200).json({ user: null });
    const user = await User.findById(userId).select('-password').lean();
    if (!user) return res.status(200).json({ user: null });
    res.json({
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        bloodType: user.bloodType,
        phone: user.phone,
        location: user.location,
        latitude: user.latitude,
        longitude: user.longitude,
        address: user.address,
        signature: user.signature
      }
    });
  } catch (err) { next(err); }
};

const updateProfile = async (req, res, next) => {
  try {
    const userId = req.user?.id || req.headers['x-mock-user-id'];
    if (!userId) return res.status(401).json({ message: 'Not authenticated' });
    const { name, phone, bloodType, location, latitude, longitude, address, signature } = req.body;
    const updates = {};
    if (name) updates.name = name;
    if (phone) updates.phone = phone;
    if (bloodType) updates.bloodType = bloodType;
    if (location !== undefined) updates.location = location;
    if (latitude !== undefined) updates.latitude = latitude ? parseFloat(latitude) : null;
    if (longitude !== undefined) updates.longitude = longitude ? parseFloat(longitude) : null;
    if (signature !== undefined) updates.signature = signature; // blood bank: data URL or empty string to clear
    if (address) {
      updates.address = {
        street: address.street,
        area: address.area,
        city: address.city,
        state: address.state,
        pincode: address.pincode
      };
    }
    const user = await User.findByIdAndUpdate(userId, updates, { new: true }).select('-password').lean();
    if (!user) {
      return res.status(404).json({ message: 'User not found. Please log out and log in again (your session may be from before a database reset).' });
    }
    const userResponse = {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
      bloodType: user.bloodType,
      phone: user.phone,
      location: user.location,
      latitude: user.latitude,
      longitude: user.longitude,
      address: user.address,
      signature: user.signature
    };
    res.json({ message: 'Profile updated', user: userResponse });
  } catch (err) { next(err); }
};

const changePassword = async (req, res, next) => {
  try {
    const userId = req.user?.id || req.headers['x-mock-user-id'];
    const { currentPassword, newPassword } = req.body;
    if (!userId) return res.status(401).json({ message: 'Not authenticated' });
    if (!newPassword) return res.status(400).json({ message: 'New password required' });

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (currentPassword && !(await user.matchPassword(currentPassword))) {
      return res.status(400).json({ message: 'Current password incorrect' });
    }
    user.password = newPassword;
    await user.save();
    res.json({ message: 'Password updated' });
  } catch (err) { next(err); }
};

module.exports.getMe = getMe;
module.exports.updateProfile = updateProfile;
module.exports.changePassword = changePassword;
