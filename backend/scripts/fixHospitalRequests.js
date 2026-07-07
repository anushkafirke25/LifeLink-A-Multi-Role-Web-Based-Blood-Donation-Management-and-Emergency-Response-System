// Script to reassign blood requests to current hospital users
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');
const BloodRequest = require('../models/BloodRequest');

dotenv.config();

const connectDB = async () => {
  try {
    const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/lifelink';
    await mongoose.connect(uri);
    console.log('✅ MongoDB Connected');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

const fixRequests = async () => {
  try {
    await connectDB();
    
    console.log('\n🔧 Fixing hospital request assignments...\n');
    
    // Get all hospitals
    const hospitals = await User.find({ role: 'hospital' }).lean();
    console.log(`Found ${hospitals.length} hospitals:`);
    hospitals.forEach(h => console.log(`  - ${h.name} (${h.email}) - ID: ${h._id}`));
    
    // Get all requests
    const allRequests = await BloodRequest.find().lean();
    console.log(`\nFound ${allRequests.length} total blood requests`);
    
    if (hospitals.length === 0) {
      console.log('❌ No hospitals found! Please create hospital users first.');
      process.exit(1);
    }
    
    // Distribute requests evenly among hospitals
    const hospitalMap = {
      'City General Hospital': hospitals.find(h => h.name.includes('General') || h.email.includes('general')),
      'Apollo Multispecialty Hospital': hospitals.find(h => h.name.includes('Apollo') || h.email.includes('apollo')),
      'Fortis Healthcare': hospitals.find(h => h.name.includes('Fortis') || h.email.includes('fortis'))
    };
    
    console.log('\n🔄 Reassigning requests...\n');
    
    let updated = 0;
    for (const request of allRequests) {
      // Try to find original hospital by populating
      const requestWithHospital = await BloodRequest.findById(request._id).populate('hospital');
      let newHospitalId;
      
      if (requestWithHospital.hospital?.name) {
        // Try to match by name
        const hospitalName = requestWithHospital.hospital.name;
        newHospitalId = hospitalMap[hospitalName]?._id || hospitals[0]._id;
      } else {
        // Distribute evenly if no match
        newHospitalId = hospitals[updated % hospitals.length]._id;
      }
      
      await BloodRequest.findByIdAndUpdate(request._id, { hospital: newHospitalId });
      updated++;
    }
    
    console.log(`✅ Updated ${updated} blood requests`);
    
    // Show summary
    console.log('\n📊 Summary by hospital:');
    for (const hospital of hospitals) {
      const count = await BloodRequest.countDocuments({ hospital: hospital._id });
      console.log(`  - ${hospital.name}: ${count} requests`);
    }
    
    console.log('\n🎉 Done!\n');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('👋 Database connection closed');
  }
};

fixRequests();

