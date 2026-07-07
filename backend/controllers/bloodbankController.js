// controllers/bloodbankController.js
const Inventory = require('../models/Inventory');
const Donation = require('../models/Donation');
const User = require('../models/User');
const Notification = require('../models/Notification');
const { sortByDistance } = require('../utils/distance');
const { sortByAddressDistance } = require('../utils/pincodeDistance');
const { haversineKm, getLat, getLng } = require('../utils/haversine');

// Hypothetical units per blood type when a blood bank has no inventory record (for UI/filters)
const HYPOTHETICAL_UNITS = 5;
const BLOOD_TYPES = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

// Helper function to format full address
function formatFullAddress(address) {
  if (!address) return null;
  const parts = [];
  if (address.street) parts.push(address.street);
  if (address.area) parts.push(address.area);
  if (address.city) parts.push(address.city);
  if (address.state) parts.push(address.state);
  if (address.pincode) parts.push(address.pincode);
  return parts.join(', ');
}

// Return ALL blood banks with real names/addresses; each with real or hypothetical inventory. Supports lat/lng for distance.
exports.getAllInventory = async (req, res, next) => {
  try {
    const lat = req.query.lat != null ? Number(req.query.lat) : null;
    const lng = req.query.lng != null ? Number(req.query.lng) : null;
    const useCoords = typeof lat === 'number' && !isNaN(lat) && typeof lng === 'number' && !isNaN(lng);

    // Hospital location: prefer query lat/lng, else from logged-in hospital
    let refLat = useCoords ? lat : null;
    let refLng = useCoords ? lng : null;
    let hospital = null;
    if (!useCoords) {
      const hospitalId = req.headers['x-mock-user-id'] || req.user?.id;
      if (hospitalId) {
        hospital = await User.findById(hospitalId).select('latitude longitude address location').lean();
        if (hospital?.latitude != null && hospital?.longitude != null) {
          refLat = hospital.latitude;
          refLng = hospital.longitude;
        }
      }
    }

    // All blood bank users (real names, addresses, coords)
    const bloodBanks = await User.find({ role: 'bloodbank' })
      .select('name location phone latitude longitude address')
      .lean();

    // Existing inventory: bloodBankId -> { bloodType -> units }
    const inventoryList = await Inventory.find().lean();
    const inventoryByBank = {};
    inventoryList.forEach(inv => {
      const id = inv.bloodBank?.toString?.() || inv.bloodBank;
      if (!id) return;
      if (!inventoryByBank[id]) inventoryByBank[id] = {};
      inventoryByBank[id][inv.bloodType] = inv.units;
    });

    // Build one row per (bloodBank, bloodType); use real units or hypothetical
    const mapped = [];
    for (const bb of bloodBanks) {
      const bbId = bb._id.toString();
      const fullAddress = formatFullAddress(bb.address);
      const bbLat = getLat(bb) ?? bb.latitude;
      const bbLng = getLng(bb) ?? bb.longitude;

      for (const bloodType of BLOOD_TYPES) {
        const units = (inventoryByBank[bbId] && inventoryByBank[bbId][bloodType] != null)
          ? inventoryByBank[bbId][bloodType]
          : HYPOTHETICAL_UNITS;
        const item = {
          _id: `${bbId}-${bloodType}`,
          bloodBank: {
            ...bb,
            fullAddress
          },
          bloodType,
          units,
          latitude: bbLat,
          longitude: bbLng,
          address: bb.address
        };
        mapped.push(item);
      }
    }

    // Attach distance and sort
    if (refLat != null && refLng != null) {
      mapped.forEach(item => {
        const itemLat = item.latitude;
        const itemLng = item.longitude;
        item.distance = (itemLat != null && itemLng != null)
          ? haversineKm(refLat, refLng, itemLat, itemLng)
          : null;
      });
      mapped.sort((a, b) => {
        if (a.distance == null) return 1;
        if (b.distance == null) return -1;
        return a.distance - b.distance;
      });
    } else if (hospital?.address) {
      const withDistance = sortByAddressDistance(mapped, hospital.address);
      mapped.length = 0;
      mapped.push(...withDistance);
    } else if (hospital?.latitude != null && hospital?.longitude != null) {
      const withDistance = sortByDistance(mapped, hospital.latitude, hospital.longitude);
      mapped.length = 0;
      mapped.push(...withDistance);
    } else {
      mapped.forEach(item => { item.distance = null; });
    }

    res.json({ data: mapped });
  } catch (e) { next(e); }
};

exports.list = async (req, res, next) => {
  try {
    const bloodBanks = await User.find({ role: 'bloodbank' })
      .select('name email phone')
      .lean();
    res.json({ data: bloodBanks });
  } catch (e) { next(e); }
};

exports.create = async (req, res, next) => {
  try { res.status(201).json({ message: 'bloodbank created (stub)', body: req.body }); } catch (e) { next(e); }
};

exports.getOne = async (req, res, next) => {
  try { res.json({ id: req.params.id, message: 'bloodbank getOne (stub)' }); } catch (e) { next(e); }
};

exports.update = async (req, res, next) => {
  try { res.json({ id: req.params.id, message: 'bloodbank update (stub)', body: req.body }); } catch (e) { next(e); }
};

exports.remove = async (req, res, next) => {
  try { res.json({ id: req.params.id, message: 'bloodbank remove (stub)' }); } catch (e) { next(e); }
};

// --- Frontend-expected endpoints ---
exports.dashboard = async (req, res, next) => {
  try { res.json({ totalUnits: 0, expiringSoon: 0 }); } catch (e) { next(e); }
};

exports.inventory = async (req, res, next) => {
  try {
    const bloodBankId = req.user?.id || req.headers['x-mock-user-id'];
    const items = await Inventory.find({ bloodBank: bloodBankId }).lean();
    res.json({ inventory: items });
  } catch (e) { next(e); }
};

exports.updateInventory = async (req, res, next) => {
  try {
    const bloodBankId = req.user?.id || req.headers['x-mock-user-id'];
    const { bloodType } = req.params;
    const { units } = req.body;
    const item = await Inventory.findOneAndUpdate(
      { bloodBank: bloodBankId, bloodType },
      { $set: { units: Math.max(0, Number(units) || 0) } },
      { upsert: true, new: true }
    );
    res.json({ message: 'inventory updated', item });
  } catch (e) { next(e); }
};

exports.pendingDonors = async (req, res, next) => {
  try {
    const bloodBankId = req.user?.id || req.headers['x-mock-user-id'];
    const pending = await Donation.find({ bloodBank: bloodBankId, status: 'scheduled' })
      .populate('donor', 'name bloodType phone')
      .lean();
    res.json({ donors: pending.map(d => ({ 
      _id: d._id, 
      name: d.donor?.name, 
      bloodType: d.donor?.bloodType,
      phone: d.donor?.phone,
      scheduledDate: d.donationDate 
    })) });
  } catch (e) { next(e); }
};

// Add a new donor and schedule donation
// Search for existing donors by name or email
exports.searchDonors = async (req, res, next) => {
  try {
    const { query } = req.query;
    if (!query || query.length < 2) {
      return res.json({ donors: [] });
    }
    
    const donors = await User.find({
      role: 'donor',
      $or: [
        { name: { $regex: query, $options: 'i' } },
        { email: { $regex: query, $options: 'i' } },
        { phone: { $regex: query, $options: 'i' } }
      ]
    })
    .select('name email phone bloodType location')
    .limit(10)
    .lean();
    
    res.json({ donors });
  } catch (e) { next(e); }
};

// Record a donation (new or existing donor)
exports.recordDonation = async (req, res, next) => {
  try {
    const bloodBankId = req.user?.id || req.headers['x-mock-user-id'];
    if (!bloodBankId) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    const { 
      donorId, // If existing donor
      name, email, phone, bloodType, location, password, // If new donor
      units, notes, testResults // Donation details
    } = req.body;
    
    let donor;
    let isNewDonor = false;
    
    // If donorId provided, use existing donor
    if (donorId) {
      donor = await User.findById(donorId);
      if (!donor || donor.role !== 'donor') {
        return res.status(404).json({ message: 'Donor not found' });
      }
    } else {
      // Check if donor exists by email
      donor = await User.findOne({ email: email?.toLowerCase() });
      
      if (!donor) {
        // Create new donor - password is required
        if (!password) {
          return res.status(400).json({ message: 'Password is required when creating a new donor' });
        }
        isNewDonor = true;
        donor = await User.create({
          name,
          email: email?.toLowerCase(),
          phone,
          bloodType,
          location,
          password,
          role: 'donor'
        });
      } else {
        // Update existing donor info if provided
        if (name) donor.name = name;
        if (phone) donor.phone = phone;
        if (bloodType) donor.bloodType = bloodType;
        if (location) donor.location = location;
        await donor.save();
      }
    }
    
    // Calculate next donation date (90 days from today)
    const today = new Date();
    const nextDonationDate = new Date(today);
    nextDonationDate.setDate(today.getDate() + 90);
    
    // Create donation record with status 'completed' (blood already donated)
    const donation = await Donation.create({
      donor: donor._id,
      bloodBank: bloodBankId,
      bloodType: donor.bloodType || bloodType,
      units: units || 1,
      status: 'completed',
      donationDate: today,
      nextDonationDate: nextDonationDate,
      notes,
      testResults
    });
    
    // Update inventory - add the donated blood
    await Inventory.findOneAndUpdate(
      { bloodBank: bloodBankId, bloodType: donor.bloodType || bloodType },
      { $inc: { units: units || 1 } },
      { upsert: true }
    );
    
    // Create scheduled donation for next time (90 days from now)
    // This will be visible to the donor on their dashboard
    const scheduledDonation = await Donation.create({
      donor: donor._id,
      bloodBank: bloodBankId,
      bloodType: donor.bloodType || bloodType,
      units: 1,
      status: 'scheduled',
      donationDate: nextDonationDate,
      notes: 'Next donation scheduled - 90 days from last donation'
    });
    
    res.status(201).json({ 
      message: isNewDonor ? 'New donor created and donation recorded' : 'Donation recorded successfully',
      donor: {
        id: donor._id.toString(),
        name: donor.name,
        email: donor.email,
        bloodType: donor.bloodType,
        isNew: isNewDonor
      },
      donation: {
        id: donation._id.toString(),
        donationDate: donation.donationDate,
        nextDonationDate: nextDonationDate
      },
      scheduledDonation: {
        id: scheduledDonation._id.toString(),
        scheduledDate: scheduledDonation.donationDate
      }
    });
  } catch (e) { 
    console.error('Error recording donation:', e);
    next(e); 
  }
};

// Legacy function - keeping for backward compatibility
exports.addDonor = async (req, res, next) => {
  try {
    const bloodBankId = req.user?.id || req.headers['x-mock-user-id'];
    if (!bloodBankId) {
      return res.status(401).json({ message: 'Authentication required to add donor. Please login as a blood bank.' });
    }
    const { name, email, phone, bloodType, scheduledDate, password } = req.body;

    // Create new donor user if email doesn't exist
    let donor = await User.findOne({ email });
    if (!donor) {
      // Password is required when creating a new donor
      if (!password) {
        return res.status(400).json({ message: 'Password is required when creating a new donor' });
      }
      donor = await User.create({
        name,
        email,
        phone,
        bloodType,
        password,
        role: 'donor'
      });
    }

    // Create donation record
    const donation = await Donation.create({
      donor: donor._id,
      bloodBank: bloodBankId,
      bloodType,
      status: 'scheduled',
      donationDate: scheduledDate || new Date()
    });

    res.status(201).json({ 
      message: 'Donor added and donation scheduled',
      donor: {
        id: donor._id,
        name: donor.name,
        bloodType: donor.bloodType
      },
      donation: {
        id: donation._id,
        scheduledDate: donation.donationDate
      }
    });
  } catch (e) { next(e); }
};

exports.approveDonation = async (req, res, next) => {
  try {
    const bloodBankId = req.user?.id || req.headers['x-mock-user-id'];
    const { donationId } = req.params;
    const donation = await Donation.findOneAndUpdate(
      { _id: donationId, bloodBank: bloodBankId },
      { $set: { status: 'completed', donationDate: new Date() } },
      { new: true }
    );
    if (!donation) return res.status(404).json({ message: 'Donation not found' });
    await Inventory.findOneAndUpdate(
      { bloodBank: bloodBankId, bloodType: donation.bloodType },
      { $inc: { units: donation.units } },
      { upsert: true }
    );
    res.json({ message: 'donation approved', donation });
  } catch (e) { next(e); }
};

const BloodRequest = require('../models/BloodRequest');
exports.hospitalRequests = async (req, res, next) => {
  try {
    const bloodBankId = req.user?.id || req.headers['x-mock-user-id'];
    
    // Get ALL hospital requests (visible to all blood banks) - per LATEST_CHANGES.md
    const list = await BloodRequest.find()
      .populate('hospital', 'name phone')
      .sort('-createdAt')
      .lean();

    // Get current inventory for this blood bank
    const inventory = await Inventory.find({ bloodBank: bloodBankId }).lean();
    const inventoryMap = inventory.reduce((acc, item) => {
      acc[item.bloodType] = item.units;
      return acc;
    }, {});

    // Add availability info to each request based on this blood bank's inventory
    const requestsWithAvailability = list.map(request => ({
      ...request,
      availableUnits: inventoryMap[request.bloodType] || 0,
      canFulfill: (inventoryMap[request.bloodType] || 0) >= request.units
    }));

    res.json({ 
      requests: requestsWithAvailability,
      inventory: inventoryMap
    });
  } catch (e) { next(e); }
};

exports.processRequest = async (req, res, next) => {
  try {
    const bloodBankId = req.user?.id || req.headers['x-mock-user-id'];
    if (!bloodBankId) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const { requestId } = req.params;
    const { status, units, note } = req.body;

    if (!status) {
      return res.status(400).json({ message: 'Status is required' });
    }

    const request = await BloodRequest.findById(requestId);
    if (!request) {
      return res.status(404).json({ message: 'Blood request not found' });
    }

    let inventory = null;
    const unitsToFulfill = units ? parseInt(units) : request.units;

    if (status === 'approved' || status === 'fulfilled') {
      // Get current inventory
      inventory = await Inventory.findOne({
        bloodBank: bloodBankId,
        bloodType: request.bloodType
      });

      const availableUnits = inventory?.units || 0;
      
      // Handle partial fulfillment
      if (availableUnits === 0) {
        return res.status(400).json({
          message: 'No blood units available in inventory',
          available: 0,
          requested: unitsToFulfill
        });
      }

      // Calculate how many units we can actually fulfill
      const unitsToDeduct = Math.min(availableUnits, unitsToFulfill);
      const remainingUnits = request.units - unitsToDeduct;

      // Update inventory - deduct what we can fulfill
      await Inventory.findOneAndUpdate(
        { bloodBank: bloodBankId, bloodType: request.bloodType },
        { $inc: { units: -unitsToDeduct } }
      );

      // Update request with fulfilled units
      request.fulfilledUnits = (request.fulfilledUnits || 0) + unitsToDeduct;
      request.bloodBank = bloodBankId; // Track which blood bank fulfilled

      // If we fulfilled all units, mark as fulfilled
      if (remainingUnits <= 0) {
        request.status = 'fulfilled';
        request.units = request.fulfilledUnits; // Update to show fulfilled amount
      } else {
        // Partial fulfillment - update request units to remaining and keep status as pending
        request.units = remainingUnits;
        request.status = 'pending'; // Keep pending for remaining units
        // Add note about partial fulfillment
        const partialNote = `Partially fulfilled: ${unitsToDeduct} units by ${(await User.findById(bloodBankId).select('name').lean())?.name || 'Blood Bank'}. Remaining: ${remainingUnits} units.`;
        request.notes = request.notes ? `${request.notes}\n${partialNote}` : partialNote;
      }
    } else {
      // For other statuses (like rejected), just update
      request.status = status;
      if (note) {
        request.notes = (request.notes ? request.notes + '\n' : '') + `[${new Date().toISOString()}] ${status}: ${note}`;
      }
    }
    
    await request.save();

    // Get updated inventory for response
    if (!inventory && (status === 'fulfilled' || status === 'approved')) {
      inventory = await Inventory.findOne({
        bloodBank: bloodBankId,
        bloodType: request.bloodType
      });
    }

    const responseMessage = (request.status === 'pending' && request.fulfilledUnits && request.fulfilledUnits > 0)
      ? `Request partially fulfilled: ${request.fulfilledUnits} units. Remaining: ${request.units} units.`
      : `Request ${request.status}`;

    res.json({ 
      message: responseMessage, 
      request: request.toObject(),
      remainingInventory: inventory ? inventory.units : null,
      fulfilledUnits: request.fulfilledUnits || 0,
      remainingUnits: request.status === 'pending' ? request.units : 0
    });
  } catch (e) {
    console.error('Error processing request:', e);
    next(e);
  }
};

exports.recentDonations = async (req, res, next) => {
  try {
    const bloodBankId = req.user?.id || req.headers['x-mock-user-id'];
    // Include both completed and scheduled donations so recent additions are visible
    const list = await Donation.find({ bloodBank: bloodBankId, status: { $in: ['completed', 'scheduled'] } })
      .populate('donor', 'name bloodType phone email')
      .sort('-donationDate')
      .limit(50)
      .lean();

    const formatted = list.map(d => ({
      _id: d._id,
      donor: d.donor ? { name: d.donor.name, bloodType: d.donor.bloodType, phone: d.donor.phone, email: d.donor.email } : null,
      bloodType: d.bloodType,
      units: d.units,
      status: d.status,
      donationDate: d.donationDate
    }));

    res.json({ donations: formatted });
  } catch (e) { next(e); }
};

// List all donors (scheduled/completed) for this blood bank
exports.listDonors = async (req, res, next) => {
  try {
    const bloodBankId = req.user?.id || req.headers['x-mock-user-id'];
    const list = await Donation.find({ bloodBank: bloodBankId })
      .populate('donor', 'name email phone bloodType')
      .sort('-donationDate')
      .lean();

    const formatted = list.map(d => ({
      donationId: d._id,
      status: d.status,
      donationDate: d.donationDate,
      bloodType: d.bloodType,
      units: d.units,
      donor: d.donor ? { id: d.donor._id, name: d.donor.name, email: d.donor.email, phone: d.donor.phone, bloodType: d.donor.bloodType } : null
    }));

    res.json({ donors: formatted });
  } catch (e) { next(e); }
};

// Get eligible donors (90 days passed since last donation)
exports.getEligibleDonors = async (req, res, next) => {
  try {
    const bloodBankId = req.user?.id || req.headers['x-mock-user-id'];
    const today = new Date();
    const ninetyDaysAgo = new Date(today);
    ninetyDaysAgo.setDate(today.getDate() - 90);

    // Find all completed donations for this blood bank
    const completedDonations = await Donation.find({
      bloodBank: bloodBankId,
      status: 'completed'
    })
      .populate('donor', 'name email phone bloodType location')
      .sort('-donationDate')
      .lean();

    // Group by donor and get their last donation date
    const donorLastDonation = {};
    completedDonations.forEach(donation => {
      if (donation.donor) {
        const donorId = donation.donor._id.toString();
        if (!donorLastDonation[donorId] || 
            new Date(donation.donationDate) > new Date(donorLastDonation[donorId].donationDate)) {
          donorLastDonation[donorId] = {
            donor: donation.donor,
            lastDonationDate: donation.donationDate,
            donationId: donation._id
          };
        }
      }
    });

    // Filter donors who completed 90 days
    const eligibleDonors = Object.values(donorLastDonation)
      .filter(item => {
        const lastDonationDate = new Date(item.lastDonationDate);
        return lastDonationDate <= ninetyDaysAgo;
      })
      .map(item => ({
        donor: {
          id: item.donor._id,
          name: item.donor.name,
          email: item.donor.email,
          phone: item.donor.phone,
          bloodType: item.donor.bloodType,
          location: item.donor.location
        },
        lastDonationDate: item.lastDonationDate,
        daysSinceLastDonation: Math.floor((today - new Date(item.lastDonationDate)) / (1000 * 60 * 60 * 24)),
        lastDonationId: item.donationId
      }));

    res.json({ eligibleDonors });
  } catch (e) { next(e); }
};

// Send reminder to donor
exports.sendReminder = async (req, res, next) => {
  try {
    const bloodBankId = req.user?.id || req.headers['x-mock-user-id'];
    const { donorId } = req.body;

    const donor = await User.findById(donorId);
    if (!donor || donor.role !== 'donor') {
      return res.status(404).json({ message: 'Donor not found' });
    }

    const bloodBank = await User.findById(bloodBankId);
    const message = `${bloodBank?.name || 'Blood Bank'} is reminding you that you are eligible to donate blood again. Please schedule an appointment!`;

    await Notification.create({
      donor: donorId,
      bloodBank: bloodBankId,
      type: 'reminder',
      message
    });

    res.json({ message: 'Reminder sent successfully' });
  } catch (e) { next(e); }
};

// Schedule appointment
exports.scheduleAppointment = async (req, res, next) => {
  try {
    const bloodBankId = req.user?.id || req.headers['x-mock-user-id'];
    const { donorId, appointmentDate } = req.body;

    if (!donorId || !appointmentDate) {
      return res.status(400).json({ message: 'Donor ID and appointment date are required' });
    }

    const donor = await User.findById(donorId);
    if (!donor || donor.role !== 'donor') {
      return res.status(404).json({ message: 'Donor not found' });
    }

    const appointmentDateTime = new Date(appointmentDate);
    if (appointmentDateTime < new Date()) {
      return res.status(400).json({ message: 'Appointment date cannot be in the past' });
    }

    // Create or update donation record with appointment
    const donation = await Donation.findOneAndUpdate(
      {
        donor: donorId,
        bloodBank: bloodBankId,
        status: { $in: ['scheduled', 'completed'] }
      },
      {
        $set: {
          appointmentDate: appointmentDateTime,
          status: 'scheduled',
          donationDate: appointmentDateTime
        }
      },
      {
        upsert: true,
        new: true
      }
    );

    // Create notification for donor
    const bloodBank = await User.findById(bloodBankId);
    await Notification.create({
      donor: donorId,
      bloodBank: bloodBankId,
      type: 'appointment_scheduled',
      message: `Your blood donation appointment is scheduled at ${bloodBank?.name || 'Blood Bank'} on ${appointmentDateTime.toLocaleDateString()} at ${appointmentDateTime.toLocaleTimeString()}`,
      appointmentDate: appointmentDateTime,
      donationId: donation._id
    });

    res.json({ 
      message: 'Appointment scheduled successfully',
      appointment: {
        id: donation._id,
        appointmentDate: appointmentDateTime,
        donor: {
          id: donor._id,
          name: donor.name,
          email: donor.email
        }
      }
    });
  } catch (e) { next(e); }
};

// Get scheduled appointments
exports.getAppointments = async (req, res, next) => {
  try {
    const bloodBankId = req.user?.id || req.headers['x-mock-user-id'];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const appointments = await Donation.find({
      bloodBank: bloodBankId,
      status: 'scheduled',
      appointmentDate: { $exists: true, $gte: today }
    })
      .populate('donor', 'name email phone bloodType')
      .sort('appointmentDate')
      .lean();

    const formatted = appointments.map(apt => ({
      id: apt._id,
      appointmentDate: apt.appointmentDate,
      donor: apt.donor ? {
        id: apt.donor._id,
        name: apt.donor.name,
        email: apt.donor.email,
        phone: apt.donor.phone,
        bloodType: apt.donor.bloodType
      } : null,
      bloodType: apt.bloodType,
      isToday: new Date(apt.appointmentDate).toDateString() === today.toDateString()
    }));

    res.json({ appointments: formatted });
  } catch (e) { next(e); }
};

// Mark donation as done (opens record donation form)
exports.markDonationDone = async (req, res, next) => {
  try {
    const bloodBankId = req.user?.id || req.headers['x-mock-user-id'];
    const { donationId } = req.params;

    const donation = await Donation.findById(donationId)
      .populate('donor', 'name email phone bloodType location');

    if (!donation || donation.bloodBank.toString() !== bloodBankId) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    // Return donor info to pre-fill the record donation form
    res.json({
      message: 'Ready to record donation',
      donor: donation.donor ? {
        id: donation.donor._id,
        name: donation.donor.name,
        email: donation.donor.email,
        phone: donation.donor.phone,
        bloodType: donation.donor.bloodType,
        location: donation.donor.location
      } : null,
      appointmentDate: donation.appointmentDate
    });
  } catch (e) { next(e); }
};