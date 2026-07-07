// controllers/donorController.js
exports.list = async (req, res, next) => {
  try { res.json({ data: [], message: 'list donors' }); } catch (e) { next(e); }
};

exports.create = async (req, res, next) => {
  try { res.status(201).json({ message: 'donor created (stub)', body: req.body }); } catch (e) { next(e); }
};

exports.getOne = async (req, res, next) => {
  try { res.json({ id: req.params.id, message: 'get one (stub)' }); } catch (e) { next(e); }
};

exports.update = async (req, res, next) => {
  try { res.json({ id: req.params.id, message: 'updated (stub)', body: req.body }); } catch (e) { next(e); }
};

exports.remove = async (req, res, next) => {
  try { res.json({ id: req.params.id, message: 'removed (stub)' }); } catch (e) { next(e); }
};

// --- Endpoints expected by frontend ---
exports.dashboard = async (req, res, next) => {
  try {
    const donorId = req.user?.id || req.headers['x-mock-user-id'];
    const Donation = require('../models/Donation');
    const totalDonations = await Donation.countDocuments({ donor: donorId, status: 'completed' });
    const lastDonation = await Donation.findOne({ donor: donorId, status: 'completed' }).sort('-donationDate').lean();
    res.json({ data: { stats: { totalDonations, livesSaved: totalDonations, certificates: Math.floor(totalDonations/5) }, lastDonation } });
  } catch (e) { next(e); }
};

exports.emergencyRequests = async (req, res, next) => {
  try {
    const donorId = req.user?.id || req.headers['x-mock-user-id'];
    const User = require('../models/User');
    const BloodRequest = require('../models/BloodRequest');
    const DonorResponse = require('../models/DonorResponse');
    
    // Get donor's blood type
    const donor = await User.findById(donorId).select('bloodType').lean();
    const donorBloodType = donor?.bloodType;
    
    // Build query - filter by blood type if donor has one
    const query = { 
      status: 'pending',
      priority: { $in: ['critical', 'urgent'] }
    };
    
    if (donorBloodType) {
      query.bloodType = donorBloodType;
    }
    
    const list = await BloodRequest.find(query)
      .populate('hospital', 'name phone location')
      .sort('-createdAt')
      .limit(20)
      .lean();
    
    // Check which requests the donor has already responded to
    const responseIds = await DonorResponse.find({ donor: donorId })
      .select('request')
      .lean();
    const respondedRequestIds = new Set(responseIds.map(r => r.request.toString()));
    
    // Add response status to each request
    const requestsWithStatus = list.map(request => ({
      ...request,
      hasResponded: respondedRequestIds.has(request._id.toString())
    }));
    
    res.json({ requests: requestsWithStatus });
  } catch (e) { next(e); }
};

exports.respond = async (req, res, next) => {
  try {
    const donorId = req.user?.id || req.headers['x-mock-user-id'];
    const { requestId } = req.params;
    const { availableDate, availableTime, message } = req.body;
    
    if (!donorId) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    if (!availableDate || !availableTime) {
      return res.status(400).json({ message: 'Available date and time are required' });
    }
    
    const BloodRequest = require('../models/BloodRequest');
    const DonorResponse = require('../models/DonorResponse');
    const User = require('../models/User');
    
    // Verify request exists and is pending
    const request = await BloodRequest.findById(requestId);
    if (!request) {
      return res.status(404).json({ message: 'Blood request not found' });
    }
    
    if (request.status !== 'pending') {
      return res.status(400).json({ message: 'This request is no longer pending' });
    }
    
    // Verify donor's blood type matches request
    const donor = await User.findById(donorId);
    if (donor.bloodType !== request.bloodType) {
      return res.status(400).json({ 
        message: `Your blood type (${donor.bloodType}) does not match the required blood type (${request.bloodType})` 
      });
    }
    
    // Check if donor already responded
    const existingResponse = await DonorResponse.findOne({ 
      request: requestId, 
      donor: donorId 
    });
    
    if (existingResponse) {
      return res.status(400).json({ message: 'You have already responded to this request' });
    }
    
    // Create response
    const response = await DonorResponse.create({
      request: requestId,
      donor: donorId,
      availableDate: new Date(availableDate),
      availableTime: availableTime,
      message: message || '',
      status: 'pending'
    });
    
    res.json({ 
      message: 'Response recorded successfully',
      response: {
        id: response._id,
        availableDate: response.availableDate,
        availableTime: response.availableTime
      }
    });
  } catch (e) {
    if (e.code === 11000) {
      return res.status(400).json({ message: 'You have already responded to this request' });
    }
    next(e);
  }
};

const Donation = require('../models/Donation');
exports.history = async (req, res, next) => {
  try {
    const donorId = req.user?.id || req.headers['x-mock-user-id'];
    const mongoose = require('mongoose');
    
    // Convert to ObjectId
    const donorObjectId = mongoose.Types.ObjectId.isValid(donorId) 
      ? new mongoose.Types.ObjectId(donorId) 
      : donorId;
    
    // Get all donations (completed and scheduled)
    const donations = await Donation.find({ donor: donorObjectId })
      .populate('bloodBank', 'name location phone signature')
      .sort('-donationDate')
      .lean();
    
    res.json({ history: donations });
  } catch (e) { next(e); }
};

exports.scheduleDonation = async (req, res, next) => {
  try { res.status(201).json({ message: 'donation scheduled', data: req.body }); } catch (e) { next(e); }
};

exports.achievements = async (req, res, next) => {
  try { res.json({ badges: [] }); } catch (e) { next(e); }
};

// Get notifications for donor
exports.getNotifications = async (req, res, next) => {
  try {
    const donorId = req.user?.id || req.headers['x-mock-user-id'];
    const Notification = require('../models/Notification');
    
    const notifications = await Notification.find({ donor: donorId })
      .populate('bloodBank', 'name location phone')
      .sort('-createdAt')
      .limit(50)
      .lean();
    
    res.json({ notifications });
  } catch (e) { next(e); }
};

// Mark notification as read
exports.markNotificationRead = async (req, res, next) => {
  try {
    const donorId = req.user?.id || req.headers['x-mock-user-id'];
    const { notificationId } = req.params;
    const Notification = require('../models/Notification');
    
    await Notification.findOneAndUpdate(
      { _id: notificationId, donor: donorId },
      { $set: { isRead: true } }
    );
    
    res.json({ message: 'Notification marked as read' });
  } catch (e) { next(e); }
};

// Get nearby blood banks for donor (supports real-time location: ?lat=19.07&lng=72.87)
exports.getNearbyBloodBanks = async (req, res, next) => {
  try {
    const donorId = req.user?.id || req.headers['x-mock-user-id'];
    const lat = parseFloat(req.query.lat);
    const lng = parseFloat(req.query.lng);
    const useCoords = Number.isFinite(lat) && Number.isFinite(lng);

    const User = require('../models/User');
    const Inventory = require('../models/Inventory');
    const { sortByAddressDistance } = require('../utils/pincodeDistance');
    const { haversineKm, getLat, getLng } = require('../utils/haversine');

    let donor = null;
    if (donorId) {
      donor = await User.findById(donorId).select('address name email').lean();
      if (!donor && !useCoords) {
        return res.status(200).json({ bloodBanks: [], message: 'Donor not found. Please log out and log in again (your session may be from before a database reset).' });
      }
    }
    if (!useCoords && (!donor || !donor.address || !donor.address.pincode)) {
      return res.json({ bloodBanks: [], message: 'Donor address not found. Please update your profile with address details, or use "Use my location" for real-time distance.' });
    }

    const allBloodBanks = await User.find({ role: 'bloodbank' })
      .select('name email phone location address latitude longitude')
      .lean();

    const inventories = await Inventory.find({})
      .populate('bloodBank', 'name email phone location address latitude longitude')
      .lean();
    const inventoryByBank = {};
    inventories.forEach(inv => {
      if (inv.bloodBank && inv.bloodBank._id) {
        const bankId = inv.bloodBank._id.toString();
        if (!inventoryByBank[bankId]) inventoryByBank[bankId] = [];
        inventoryByBank[bankId].push({ bloodType: inv.bloodType, units: inv.units });
      }
    });

    let list = allBloodBanks.map(bb => ({
      _id: bb._id,
      name: bb.name,
      phone: bb.phone,
      email: bb.email,
      location: bb.location,
      address: bb.address,
      latitude: bb.latitude,
      longitude: bb.longitude,
      inventory: inventoryByBank[bb._id.toString()] || []
    }));

    if (useCoords) {
      list = list.map(bb => {
        const flat = getLat(bb);
        const flng = getLng(bb);
        const distance = (flat != null && flng != null) ? haversineKm(lat, lng, flat, flng) : null;
        return { ...bb, distance };
      }).sort((a, b) => {
        if (a.distance == null) return 1;
        if (b.distance == null) return -1;
        return a.distance - b.distance;
      });
    } else {
      list = list.filter(bb => bb.address && bb.address.pincode);
      list = sortByAddressDistance(list, donor.address);
    }

    res.json({ bloodBanks: list });
  } catch (e) {
    console.error('Error getting nearby blood banks:', e);
    next(e);
  }
};

// Get nearby hospitals for donor (supports real-time location: ?lat=19.07&lng=72.87)
exports.getNearbyHospitals = async (req, res, next) => {
  try {
    const donorId = req.user?.id || req.headers['x-mock-user-id'];
    const lat = parseFloat(req.query.lat);
    const lng = parseFloat(req.query.lng);
    const useCoords = Number.isFinite(lat) && Number.isFinite(lng);

    const User = require('../models/User');
    const BloodRequest = require('../models/BloodRequest');
    const { sortByAddressDistance } = require('../utils/pincodeDistance');
    const { haversineKm, getLat, getLng } = require('../utils/haversine');

    let donor = null;
    if (donorId) {
      donor = await User.findById(donorId).select('address bloodType').lean();
      if (!donor && !useCoords) {
        return res.status(200).json({ hospitals: [], message: 'Donor not found. Please log out and log in again (your session may be from before a database reset).' });
      }
    }
    if (!useCoords && (!donor || !donor.address || !donor.address.pincode)) {
      return res.json({ hospitals: [], message: 'Donor address not found. Please update your profile or use "Use my location" for real-time distance.' });
    }

    const hospitals = await User.find({ role: 'hospital' })
      .select('name email phone location address latitude longitude')
      .lean();

    let list = hospitals.map(h => ({
      _id: h._id,
      name: h.name,
      phone: h.phone,
      email: h.email,
      location: h.location,
      address: h.address,
      latitude: h.latitude,
      longitude: h.longitude
    }));

    if (useCoords) {
      list = list.map(h => {
        const flat = getLat(h);
        const flng = getLng(h);
        const distance = (flat != null && flng != null) ? haversineKm(lat, lng, flat, flng) : null;
        return { ...h, distance };
      }).sort((a, b) => {
        if (a.distance == null) return 1;
        if (b.distance == null) return -1;
        return a.distance - b.distance;
      });
    } else {
      list = list.filter(h => h.address && h.address.pincode);
      list = sortByAddressDistance(list, donor.address);
    }

    const hospitalIds = list.map(h => h._id);
    const requests = await BloodRequest.find({
      hospital: { $in: hospitalIds },
      status: 'pending',
      ...(donor?.bloodType ? { bloodType: donor.bloodType } : {})
    }).populate('hospital', 'name').lean();

    const hospitalsWithRequests = list.map(hospital => {
      const requestCount = requests.filter(r =>
        r.hospital?._id?.toString() === hospital._id.toString()
      ).length;
      return { ...hospital, pendingRequests: requestCount };
    });

    res.json({ hospitals: hospitalsWithRequests });
  } catch (e) {
    console.error('Error getting nearby hospitals:', e);
    next(e);
  }
};