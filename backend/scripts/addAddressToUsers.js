// scripts/addAddressToUsers.js
// Script to add address fields to existing users
const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

// Sample address data for existing users (you can modify this)
const sampleAddresses = {
  hospital: {
    street: 'Hospital Street',
    area: 'Medical Area',
    city: 'Mumbai',
    state: 'Maharashtra',
    pincode: '400001'
  },
  bloodbank: {
    street: 'Blood Bank Street',
    area: 'Central Area',
    city: 'Mumbai',
    state: 'Maharashtra',
    pincode: '400002'
  },
  donor: {
    street: 'Residential Street',
    area: 'Local Area',
    city: 'Mumbai',
    state: 'Maharashtra',
    pincode: '400003'
  }
};

async function addAddressesToUsers() {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/bloodbank');
    console.log('✅ Connected to MongoDB');

    // Update hospitals
    const hospitals = await User.updateMany(
      { role: 'hospital', 'address.pincode': { $exists: false } },
      { $set: { address: sampleAddresses.hospital } }
    );
    console.log(`✅ Updated ${hospitals.modifiedCount} hospitals with address`);

    // Update blood banks
    const bloodBanks = await User.updateMany(
      { role: 'bloodbank', 'address.pincode': { $exists: false } },
      { $set: { address: sampleAddresses.bloodbank } }
    );
    console.log(`✅ Updated ${bloodBanks.modifiedCount} blood banks with address`);

    // Update donors (optional)
    const donors = await User.updateMany(
      { role: 'donor', 'address.pincode': { $exists: false } },
      { $set: { address: sampleAddresses.donor } }
    );
    console.log(`✅ Updated ${donors.modifiedCount} donors with address`);

    console.log('\n✅ Migration completed!');
    console.log('Note: You may want to update pincodes manually for accurate distances.');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

addAddressesToUsers();

