// scripts/addDiverseAddresses.js
// Script to add diverse address fields to existing users
// One state (Maharashtra) with 10 places across 2-3 cities
const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

// Diverse addresses - Maharashtra state, 10 places across Mumbai, Pune, and Nashik
const diverseAddresses = [
  // Mumbai - 4 locations
  {
    street: 'Marine Drive',
    area: 'Colaba',
    city: 'Mumbai',
    state: 'Maharashtra',
    pincode: '400001'
  },
  {
    street: 'Bandra Kurla Complex',
    area: 'Bandra',
    city: 'Mumbai',
    state: 'Maharashtra',
    pincode: '400051'
  },
  {
    street: 'Andheri West',
    area: 'Andheri',
    city: 'Mumbai',
    state: 'Maharashtra',
    pincode: '400053'
  },
  {
    street: 'Powai Lake Road',
    area: 'Powai',
    city: 'Mumbai',
    state: 'Maharashtra',
    pincode: '400076'
  },
  // Pune - 4 locations
  {
    street: 'Koregaon Park',
    area: 'Koregaon Park',
    city: 'Pune',
    state: 'Maharashtra',
    pincode: '411001'
  },
  {
    street: 'Hinjewadi IT Park',
    area: 'Hinjewadi',
    city: 'Pune',
    state: 'Maharashtra',
    pincode: '411057'
  },
  {
    street: 'Viman Nagar',
    area: 'Viman Nagar',
    city: 'Pune',
    state: 'Maharashtra',
    pincode: '411014'
  },
  {
    street: 'Baner Road',
    area: 'Baner',
    city: 'Pune',
    state: 'Maharashtra',
    pincode: '411045'
  },
  // Nashik - 2 locations
  {
    street: 'Gangapur Road',
    area: 'Gangapur',
    city: 'Nashik',
    state: 'Maharashtra',
    pincode: '422002'
  },
  {
    street: 'Satpur Industrial Area',
    area: 'Satpur',
    city: 'Nashik',
    state: 'Maharashtra',
    pincode: '422007'
  }
];

async function addDiverseAddresses() {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/bloodbank');
    console.log('✅ Connected to MongoDB');

    // Get all users without addresses
    const hospitals = await User.find({ 
      role: 'hospital', 
      $or: [
        { 'address.pincode': { $exists: false } },
        { 'address.pincode': null }
      ]
    }).lean();
    
    const bloodBanks = await User.find({ 
      role: 'bloodbank', 
      $or: [
        { 'address.pincode': { $exists: false } },
        { 'address.pincode': null }
      ]
    }).lean();
    
    const donors = await User.find({ 
      role: 'donor', 
      $or: [
        { 'address.pincode': { $exists: false } },
        { 'address.pincode': null }
      ]
    }).lean();

    console.log(`\n📋 Found ${hospitals.length} hospitals, ${bloodBanks.length} blood banks, ${donors.length} donors without addresses`);

    // Distribute addresses evenly across users
    let addressIndex = 0;
    const totalUsers = hospitals.length + bloodBanks.length + donors.length;
    
    // Update hospitals
    for (const hospital of hospitals) {
      const address = diverseAddresses[addressIndex % diverseAddresses.length];
      await User.findByIdAndUpdate(hospital._id, { $set: { address } });
      addressIndex++;
    }
    console.log(`✅ Updated ${hospitals.length} hospitals with diverse addresses`);

    // Update blood banks
    for (const bloodBank of bloodBanks) {
      const address = diverseAddresses[addressIndex % diverseAddresses.length];
      await User.findByIdAndUpdate(bloodBank._id, { $set: { address } });
      addressIndex++;
    }
    console.log(`✅ Updated ${bloodBanks.length} blood banks with diverse addresses`);

    // Update donors
    for (const donor of donors) {
      const address = diverseAddresses[addressIndex % diverseAddresses.length];
      await User.findByIdAndUpdate(donor._id, { $set: { address } });
      addressIndex++;
    }
    console.log(`✅ Updated ${donors.length} donors with diverse addresses`);

    // Show distribution summary
    console.log('\n📊 Address Distribution Summary:');
    const cityCounts = {};
    diverseAddresses.forEach(addr => {
      cityCounts[addr.city] = (cityCounts[addr.city] || 0) + 1;
    });
    Object.entries(cityCounts).forEach(([city, count]) => {
      console.log(`  ${city}: ${count} locations`);
    });

    console.log('\n✅ Migration completed!');
    console.log(`✅ Total users updated: ${totalUsers}`);
    console.log('📍 Addresses distributed across:', Object.keys(cityCounts).join(', '));
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

addDiverseAddresses();

