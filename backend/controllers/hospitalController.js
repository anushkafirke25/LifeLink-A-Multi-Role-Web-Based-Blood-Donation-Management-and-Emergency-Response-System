exports.list = async (req, res, next) => {
  try { res.json({ data: [], message: 'hospital list (stub)' }); } catch (e) { next(e); }
};

exports.create = async (req, res, next) => {
  try { res.status(201).json({ message: 'hospital created (stub)', body: req.body }); } catch (e) { next(e); }
};

exports.getOne = async (req, res, next) => {
  try { res.json({ id: req.params.id, message: 'hospital getOne (stub)' }); } catch (e) { next(e); }
};

exports.update = async (req, res, next) => {
  try { res.json({ id: req.params.id, message: 'hospital update (stub)', body: req.body }); } catch (e) { next(e); }
};

exports.remove = async (req, res, next) => {
  try { res.json({ id: req.params.id, message: 'hospital remove (stub)' }); } catch (e) { next(e); }
};

// --- Frontend-expected endpoints ---
const BloodRequest = require('../models/BloodRequest');
const Inventory = require('../models/Inventory');

exports.dashboard = async (req, res, next) => {
  try {
    const total = await BloodRequest.countDocuments({});
    const fulfilled = await BloodRequest.countDocuments({ status: 'fulfilled' });
    const pending = await BloodRequest.countDocuments({ status: 'pending' });
    res.json({ data: { stats: { totalRequests: total, fulfilledRequests: fulfilled, pendingRequests: pending, successRate: total ? Math.round((fulfilled/total)*100) : 0 } } });
  } catch (e) { next(e); }
};

exports.createRequest = async (req, res, next) => {
  try {
    const hospitalId = req.user?.id || req.headers['x-mock-user-id'];
    console.log('\n========== CREATE REQUEST ==========');
    console.log('Hospital ID from header:', hospitalId);
    console.log('Hospital ID type:', typeof hospitalId);
    const { bloodType, units, priority, notes, requiredBy } = req.body;
    
    if (!hospitalId) {
      console.log('❌ No hospital ID provided!');
      return res.status(401).json({ message: 'Hospital ID required' });
    }
    
    // Ensure hospitalId is ObjectId format for consistent storage
    const mongoose = require('mongoose');
    let hospitalObjectId;
    
    if (mongoose.Types.ObjectId.isValid(hospitalId)) {
      hospitalObjectId = new mongoose.Types.ObjectId(hospitalId);
      console.log('✅ Valid ObjectId, converted:', hospitalObjectId.toString());
    } else {
      console.log('⚠️ Invalid ObjectId format, using as string');
      hospitalObjectId = hospitalId;
    }
    
    const request = await BloodRequest.create({ 
      hospital: hospitalObjectId, 
      bloodType, 
      units: parseInt(units) || 1, 
      priority: priority || 'regular', 
      notes, 
      requiredBy,
      status: 'pending'
    });
    
    console.log('✅ Created request:', request._id.toString());
    console.log('Request hospital ID:', request.hospital.toString());
    console.log('Request details:', {
      bloodType: request.bloodType,
      units: request.units,
      priority: request.priority,
      status: request.status
    });
    
    // Populate and return
    const populated = await BloodRequest.findById(request._id)
      .populate('hospital', 'name email phone location')
      .lean();
    
    console.log('Populated request hospital:', populated.hospital?._id?.toString() || populated.hospital);
    console.log('==================================\n');
    
    res.status(201).json({ message: 'request created', data: populated });
  } catch (e) { 
    console.error('❌ Error creating request:', e);
    next(e); 
  }
};

exports.getRequests = async (req, res, next) => {
  try {
    const hospitalId = req.user?.id || req.headers['x-mock-user-id'];
    console.log('\n========== GET REQUESTS ==========');
    console.log('Hospital ID from header:', hospitalId);
    console.log('Hospital ID type:', typeof hospitalId);
    
    if (!hospitalId) {
      console.log('❌ No hospital ID provided!');
      return res.json({ requests: [] });
    }
    
    const mongoose = require('mongoose');
    const DonorResponse = require('../models/DonorResponse');
    
    // Convert hospitalId to ObjectId for MongoDB query
    let hospitalObjectId;
    if (mongoose.Types.ObjectId.isValid(hospitalId)) {
      hospitalObjectId = new mongoose.Types.ObjectId(hospitalId);
      console.log('✅ Valid ObjectId, using:', hospitalObjectId.toString());
    } else {
      console.log('❌ Invalid ObjectId format:', hospitalId);
      return res.json({ requests: [], error: 'Invalid hospital ID format' });
    }
    
    // Direct MongoDB query using ObjectId - filter by this hospital; show assigned blood bank (per LATEST_CHANGES.md)
    const list = await BloodRequest.find({ hospital: hospitalObjectId })
      .populate('hospital', 'name email phone location')
      .populate('bloodBank', 'name phone')
      .sort('-createdAt')
      .lean();
    
    // Get donor responses for each request
    const requestIds = list.map(r => r._id);
    console.log(`📋 Looking for responses for ${requestIds.length} requests`);
    console.log('Request IDs:', requestIds.map(id => id.toString()));
    
    const responses = await DonorResponse.find({ request: { $in: requestIds } })
      .populate('donor', 'name email phone bloodType location')
      .sort('availableDate')
      .lean();
    
    console.log(`📋 Found ${responses.length} total donor responses`);
    if (responses.length > 0) {
      console.log('Sample response:', {
        requestId: responses[0].request?.toString(),
        donor: responses[0].donor?.name,
        availableDate: responses[0].availableDate
      });
    }
    
    // Group responses by request ID
    const responsesByRequest = {};
    responses.forEach(response => {
      const reqId = response.request?.toString() || response.request;
      if (!responsesByRequest[reqId]) {
        responsesByRequest[reqId] = [];
      }
      responsesByRequest[reqId].push(response);
    });
    
    console.log('📋 Responses grouped by request:', Object.keys(responsesByRequest).length, 'requests have responses');
    
    // Add responses to each request
    const listWithResponses = list.map(request => {
      const reqIdStr = request._id.toString();
      const requestResponses = responsesByRequest[reqIdStr] || [];
      return {
        ...request,
        donorResponses: requestResponses,
        responseCount: requestResponses.length
      };
    });
    
    console.log(`✅ Found ${list.length} requests for hospital ${hospitalId}`);
    
    if (list.length > 0) {
      console.log('Sample requests with responses:');
      listWithResponses.slice(0, 3).forEach((req, idx) => {
        console.log(`  ${idx + 1}. ID: ${req._id}, BloodType: ${req.bloodType}, Units: ${req.units}, Status: ${req.status}, ResponseCount: ${req.responseCount}, HasResponses: ${req.donorResponses?.length || 0}`);
      });
    }
    
    console.log('==================================\n');
    
    res.json({ requests: listWithResponses });
  } catch (e) { 
    console.error('❌ Error in getRequests:', e);
    console.error('Error message:', e.message);
    console.error('Error stack:', e.stack);
    next(e); 
  }
};

exports.inventory = async (req, res, next) => {
  try {
    const items = await Inventory.find().lean();
    res.json({ inventory: items });
  } catch (e) { next(e); }
};

exports.stats = async (req, res, next) => {
  try {
    const total = await BloodRequest.countDocuments({});
    const fulfilled = await BloodRequest.countDocuments({ status: 'fulfilled' });
    const pending = await BloodRequest.countDocuments({ status: 'pending' });
    res.json({ totalRequests: total, fulfilledRequests: fulfilled, pendingRequests: pending, successRate: total ? Math.round((fulfilled/total)*100) : 0 });
  } catch (e) { next(e); }
};

exports.recentDonations = async (req, res, next) => {
  try {
    const Donation = require('../models/Donation');
    const list = await Donation.find({ status: 'completed' })
      .populate('donor', 'name bloodType')
      .populate('bloodBank', 'name')
      .sort('-donationDate')
      .limit(20)
      .lean();
    res.json({ donations: list });
  } catch (e) { next(e); }
};

// Debug endpoint to show hospital-request mapping
exports.debugRequests = async (req, res, next) => {
  try {
    const User = require('../models/User');
    const hospitals = await User.find({ role: 'hospital' }).select('_id name email').lean();
    const allRequests = await BloodRequest.find()
      .populate('hospital', 'name email')
      .select('_id bloodType units priority hospital status createdAt')
      .lean();
    
    const mapping = hospitals.map(h => {
      const hospitalIdStr = h._id.toString();
      const matchingRequests = allRequests.filter(r => {
        const reqHospitalId = r.hospital?._id?.toString() || r.hospital?.toString() || r.hospital;
        return reqHospitalId === hospitalIdStr;
      });
      
      return {
        hospitalId: hospitalIdStr,
        hospitalName: h.name,
        hospitalEmail: h.email,
        requestCount: matchingRequests.length,
        requests: matchingRequests.map(r => ({
          _id: r._id.toString(),
          bloodType: r.bloodType,
          units: r.units,
          status: r.status,
          createdAt: r.createdAt
        }))
      };
    });
    
    res.json({ 
      hospitals: mapping,
      totalRequests: allRequests.length,
      requestsWithoutHospital: allRequests.filter(r => !r.hospital).length,
      allRequests: allRequests.map(r => ({
        _id: r._id.toString(),
        hospital: r.hospital?._id?.toString() || r.hospital?.toString() || r.hospital,
        hospitalName: r.hospital?.name,
        bloodType: r.bloodType,
        status: r.status
      }))
    });
  } catch (e) { next(e); }
};