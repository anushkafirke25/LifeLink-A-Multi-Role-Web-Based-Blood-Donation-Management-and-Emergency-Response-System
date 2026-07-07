const Event = require('../models/Event');
const EventRegistration = require('../models/EventRegistration');
const xlsx = require('xlsx');

// Get all events (public view for donors)
exports.getAllEvents = async (req, res) => {
  try {
    const { status } = req.query;
    
    const query = {};
    if (status) {
      query.status = status;
    } else {
      // By default, show upcoming and ongoing events
      query.status = { $in: ['upcoming', 'ongoing'] };
    }
    
    const events = await Event.find(query)
      .populate('hospital', 'name email phone location')
      .populate('bloodBank', 'name email phone location')
      .sort({ eventDate: 1 });
    
    res.json(events);
  } catch (error) {
    console.error('Error fetching events:', error);
    res.status(500).json({ message: 'Failed to fetch events', error: error.message });
  }
};

// Get single event
exports.getEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate('hospital', 'name email phone location')
      .populate('bloodBank', 'name email phone location');
    
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    
    res.json(event);
  } catch (error) {
    console.error('Error fetching event:', error);
    res.status(500).json({ message: 'Failed to fetch event', error: error.message });
  }
};

// Get events for a specific user (hospital or bloodbank)
exports.getMyEvents = async (req, res) => {
  try {
    const userId = req.user.id;
    let userRole = req.user?.role; // Get role if available
    
    let query = {};
    
    // If role is not explicitly set, check both hospital and bloodbank for this user
    // and return whichever has events. This is a fallback for development.
    if (!userRole || userRole !== 'bloodbank') {
      // First check if this user has any hospital events
      const hospitalEvents = await Event.find({ hospital: userId })
        .populate('hospital', 'name email phone location')
        .populate('bloodBank', 'name email phone location')
        .sort({ eventDate: -1 });
      
      if (hospitalEvents && hospitalEvents.length > 0) {
        return res.json(hospitalEvents);
      }
    }
    
    if (!userRole || userRole === 'bloodbank' || userRole === 'blood_bank') {
      // Check bloodbank events
      const bloodbankEvents = await Event.find({ bloodBank: userId })
        .populate('hospital', 'name email phone location')
        .populate('bloodBank', 'name email phone location')
        .sort({ eventDate: -1 });
      
      if (bloodbankEvents && bloodbankEvents.length > 0) {
        return res.json(bloodbankEvents);
      }
    }
    
    // No events found for this user
    res.json([]);
  } catch (error) {
    console.error('Error fetching events:', error);
    res.status(500).json({ message: 'Failed to fetch events', error: error.message });
  }
};

// Create event (hospital or bloodbank)
exports.createEvent = async (req, res) => {
  try {
    const { title, description, eventDate, eventTime, location, contactInfo, requirements } = req.body;
    
    // Determine creator type from the request or user role
    // First check if user role is explicitly set
    let creatorType = 'hospital'; // default
    if (req.user?.role === 'bloodbank' || req.user?.role === 'blood_bank') {
      creatorType = 'bloodbank';
    }
    // You can also infer from the route or request body if needed
    if (req.body.creatorType && (req.body.creatorType === 'bloodbank' || req.body.creatorType === 'hospital')) {
      creatorType = req.body.creatorType;
    }
    
    const event = new Event({
      title,
      description,
      eventDate,
      eventTime,
      location,
      contactInfo,
      requirements,
      creatorType,
      hospital: creatorType === 'hospital' ? req.user.id : null,
      bloodBank: creatorType === 'bloodbank' ? req.user.id : null,
      imageUrl: req.file ? `/uploads/${req.file.filename}` : null
    });
    
    await event.save();
    
    const populatedEvent = await Event.findById(event._id)
      .populate('hospital', 'name email phone location')
      .populate('bloodBank', 'name email phone location');
    
    res.status(201).json(populatedEvent);
  } catch (error) {
    console.error('Error creating event:', error);
    res.status(500).json({ message: 'Failed to create event', error: error.message });
  }
};

// Update event (hospital or bloodbank)
exports.updateEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    
    // Check if the user owns this event
    const isHospitalOwner = event.hospital && event.hospital.toString() === req.user.id;
    const isBloodBankOwner = event.bloodBank && event.bloodBank.toString() === req.user.id;
    
    if (!isHospitalOwner && !isBloodBankOwner) {
      return res.status(403).json({ message: 'Not authorized to update this event' });
    }
    
    const { title, description, eventDate, eventTime, location, contactInfo, requirements, status } = req.body;
    
    event.title = title || event.title;
    event.description = description || event.description;
    event.eventDate = eventDate || event.eventDate;
    event.eventTime = eventTime || event.eventTime;
    event.location = location || event.location;
    event.contactInfo = contactInfo || event.contactInfo;
    event.requirements = requirements || event.requirements;
    event.status = status || event.status;
    
    if (req.file) {
      event.imageUrl = `/uploads/${req.file.filename}`;
    }
    
    await event.save();
    
    const populatedEvent = await Event.findById(event._id)
      .populate('hospital', 'name email phone location')
      .populate('bloodBank', 'name email phone location');
    
    res.json(populatedEvent);
  } catch (error) {
    console.error('Error updating event:', error);
    res.status(500).json({ message: 'Failed to update event', error: error.message });
  }
};

// Delete event (hospital or bloodbank)
exports.deleteEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    
    // Check if the user owns this event
    const isHospitalOwner = event.hospital && event.hospital.toString() === req.user.id;
    const isBloodBankOwner = event.bloodBank && event.bloodBank.toString() === req.user.id;
    
    if (!isHospitalOwner && !isBloodBankOwner) {
      return res.status(403).json({ message: 'Not authorized to delete this event' });
    }
    
    await Event.findByIdAndDelete(req.params.id);
    
    res.json({ message: 'Event deleted successfully' });
  } catch (error) {
    console.error('Error deleting event:', error);
    res.status(500).json({ message: 'Failed to delete event', error: error.message });
  }
};

// Register for event
exports.registerForEvent = async (req, res) => {
  try {
    const { eventId } = req.params;
    const { name, email, phone, bloodType, notes } = req.body;
    
    // Check if event exists
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    
    // Check if already registered
    const existingRegistration = await EventRegistration.findOne({
      event: eventId,
      email: email.toLowerCase()
    });
    
    if (existingRegistration) {
      return res.status(400).json({ message: 'Already registered for this event' });
    }
    
    // Create registration
    const registration = new EventRegistration({
      event: eventId,
      donor: req.user ? req.user.id : null,
      name,
      email,
      phone,
      bloodType,
      notes
    });
    
    await registration.save();
    
    // Update event registration count
    event.registrationCount += 1;
    await event.save();
    
    res.status(201).json(registration);
  } catch (error) {
    console.error('Error registering for event:', error);
    res.status(500).json({ message: 'Failed to register for event', error: error.message });
  }
};

// Get registrations for an event (hospital or bloodbank only)
exports.getEventRegistrations = async (req, res) => {
  try {
    const { eventId } = req.params;
    
    // Verify event belongs to user
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    
    if (req.user) {
      const isHospitalOwner = event.hospital && event.hospital.toString() === req.user.id;
      const isBloodBankOwner = event.bloodBank && event.bloodBank.toString() === req.user.id;
      
      if (!isHospitalOwner && !isBloodBankOwner) {
        return res.status(403).json({ message: 'Not authorized to view registrations' });
      }
    }
    
    const registrations = await EventRegistration.find({ event: eventId })
      .populate('donor', 'name email phone')
      .sort({ createdAt: -1 });
    
    res.json(registrations);
  } catch (error) {
    console.error('Error fetching registrations:', error);
    res.status(500).json({ message: 'Failed to fetch registrations', error: error.message });
  }
};

// Export registrations to Excel
exports.exportRegistrations = async (req, res) => {
  try {
    const { eventId } = req.params;
    
    // Verify event belongs to user
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    
    if (event.hospital && event.hospital.toString() !== req.user.id &&
        event.bloodBank && event.bloodBank.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to export registrations' });
    }
    
    const registrations = await EventRegistration.find({ event: eventId })
      .populate('donor', 'name email phone')
      .sort({ createdAt: -1 });
    
    // Prepare data for Excel
    const data = registrations.map((reg, index) => ({
      'S.No': index + 1,
      'Name': reg.name,
      'Email': reg.email,
      'Phone': reg.phone,
      'Blood Type': reg.bloodType,
      'Status': reg.status,
      'Registration Date': new Date(reg.createdAt).toLocaleDateString(),
      'Notes': reg.notes || '-'
    }));
    
    // Create workbook and worksheet
    const workbook = xlsx.utils.book_new();
    const worksheet = xlsx.utils.json_to_sheet(data);
    
    // Add worksheet to workbook
    xlsx.utils.book_append_sheet(workbook, worksheet, 'Registrations');
    
    // Generate buffer
    const buffer = xlsx.write(workbook, { type: 'buffer', bookType: 'xlsx' });
    
    // Set headers for file download
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="event-${eventId}-registrations.xlsx"`);
    
    res.send(buffer);
  } catch (error) {
    console.error('Error exporting registrations:', error);
    res.status(500).json({ message: 'Failed to export registrations', error: error.message });
  }
};


