// scripts/addNearbyFacilitiesForRahul.js
// Script to add 2 blood banks and 4 hospitals near Rahul Sharma's address
const mongoose = require('mongoose');
const User = require('../models/User');
const Inventory = require('../models/Inventory');
require('dotenv').config();

async function addNearbyFacilitiesForRahul() {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/bloodbank');
    console.log('✅ Connected to MongoDB');

    // Find Rahul Sharma
    const rahul = await User.findOne({ 
      name: { $regex: /Rahul Sharma/i },
      role: 'donor'
    }).lean();
    
    if (!rahul) {
      console.log('❌ Rahul Sharma not found. Please ensure he exists in the database.');
      process.exit(1);
    }

    console.log(`\n👤 Found Rahul Sharma:`);
    console.log(`   Email: ${rahul.email}`);
    console.log(`   Current Address:`, rahul.address || 'Not set');
    
    // If Rahul doesn't have an address, set one in Pune (based on seed data)
    let rahulAddress = rahul.address;
    if (!rahulAddress || !rahulAddress.pincode) {
      rahulAddress = {
        street: '123 MG Road',
        area: 'Koregaon Park',
        city: 'Pune',
        state: 'Maharashtra',
        pincode: '411001'
      };
      
      await User.findByIdAndUpdate(rahul._id, { $set: { address: rahulAddress } });
      console.log(`✅ Set Rahul's address to: ${rahulAddress.street}, ${rahulAddress.area}, ${rahulAddress.city}`);
    }

    // Use Rahul's actual address to ensure all facilities are in same locality
    const rahulCity = rahulAddress.city || 'Pune';
    const rahulArea = rahulAddress.area || 'Koregaon Park';
    const rahulPincode = rahulAddress.pincode || '411001';
    const rahulState = rahulAddress.state || 'Maharashtra';

    // Define nearby addresses - ALL in same locality as Rahul
    // 2 Blood Banks near Rahul (same area/city)
    const nearbyBloodBanks = [
      {
        name: 'Koregaon Park Blood Center',
        email: 'koregaon@bloodbank.com',
        password: 'password123',
        role: 'bloodbank',
        phone: '+91-20-26123457',
        address: {
          street: 'North Main Road',
          area: rahulArea, // Same area as Rahul
          city: rahulCity, // Same city
          state: rahulState,
          pincode: rahulPincode // Same pincode - very close
        },
        location: `${rahulCity}, ${rahulState}`
      },
      {
        name: 'Pune Central Blood Bank',
        email: 'pune.central@bloodbank.com',
        password: 'password123',
        role: 'bloodbank',
        phone: '+91-20-26123456',
        address: {
          street: 'Shivaji Nagar',
          area: 'Shivaji Nagar', // Adjacent area
          city: rahulCity, // Same city
          state: rahulState,
          pincode: '411005' // Close pincode (same city, different area)
        },
        location: `${rahulCity}, ${rahulState}`
      }
    ];

    // 4 Hospitals near Rahul (all in same locality)
    const nearbyHospitals = [
      {
        name: 'Ruby Hall Clinic',
        email: 'rubyhall@hospital.com',
        password: 'password123',
        role: 'hospital',
        phone: '+91-20-26123458',
        address: {
          street: '40 Sassoon Road',
          area: rahulArea, // Same area as Rahul
          city: rahulCity,
          state: rahulState,
          pincode: rahulPincode // Same pincode
        },
        location: `${rahulCity}, ${rahulState}`
      },
      {
        name: 'Jehangir Hospital',
        email: 'jehangir@hospital.com',
        password: 'password123',
        role: 'hospital',
        phone: '+91-20-26123459',
        address: {
          street: '32 Sassoon Road',
          area: rahulArea, // Same area
          city: rahulCity,
          state: rahulState,
          pincode: rahulPincode // Same pincode
        },
        location: `${rahulCity}, ${rahulState}`
      },
      {
        name: 'Koregaon Park Medical Center',
        email: 'kpmc@hospital.com',
        password: 'password123',
        role: 'hospital',
        phone: '+91-20-26123460',
        address: {
          street: 'East Street',
          area: rahulArea, // Same area
          city: rahulCity,
          state: rahulState,
          pincode: rahulPincode // Same pincode
        },
        location: `${rahulCity}, ${rahulState}`
      },
      {
        name: 'MG Road Hospital',
        email: 'mgroad@hospital.com',
        password: 'password123',
        role: 'hospital',
        phone: '+91-20-26123461',
        address: {
          street: 'MG Road',
          area: rahulArea, // Same area
          city: rahulCity,
          state: rahulState,
          pincode: rahulPincode // Same pincode
        },
        location: `${rahulCity}, ${rahulState}`
      }
    ];

    // Check if facilities already exist
    const existingBloodBanks = await User.find({
      role: 'bloodbank',
      $or: nearbyBloodBanks.map(bb => ({ email: bb.email }))
    }).lean();
    
    const existingHospitals = await User.find({
      role: 'hospital',
      $or: nearbyHospitals.map(h => ({ email: h.email }))
    }).lean();

    if (existingBloodBanks.length > 0 || existingHospitals.length > 0) {
      console.log('\n⚠️  Some facilities already exist:');
      if (existingBloodBanks.length > 0) {
        console.log(`   Blood Banks: ${existingBloodBanks.map(bb => bb.name).join(', ')}`);
      }
      if (existingHospitals.length > 0) {
        console.log(`   Hospitals: ${existingHospitals.map(h => h.name).join(', ')}`);
      }
      console.log('   Skipping creation of existing facilities...\n');
    }

    // Create blood banks
    const bloodBanksToCreate = nearbyBloodBanks.filter(
      bb => !existingBloodBanks.some(existing => existing.email === bb.email)
    );
    
    if (bloodBanksToCreate.length > 0) {
      const createdBloodBanks = await User.insertMany(bloodBanksToCreate);
      console.log(`✅ Created ${createdBloodBanks.length} blood banks near Rahul:`);
      createdBloodBanks.forEach(bb => {
        console.log(`   - ${bb.name} (${bb.address.city}, ${bb.address.pincode})`);
      });

      // Create inventory for blood banks
      const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
      for (const bank of createdBloodBanks) {
        const inventoryItems = bloodTypes.map(bt => ({
          bloodBank: bank._id,
          bloodType: bt,
          units: Math.floor(Math.random() * 50) + 10 // 10-60 units per blood type
        }));
        await Inventory.insertMany(inventoryItems);
        console.log(`   ✅ Created inventory for ${bank.name}`);
      }
    }

    // Create hospitals
    const hospitalsToCreate = nearbyHospitals.filter(
      h => !existingHospitals.some(existing => existing.email === h.email)
    );
    
    if (hospitalsToCreate.length > 0) {
      const createdHospitals = await User.insertMany(hospitalsToCreate);
      console.log(`\n✅ Created ${createdHospitals.length} hospitals near Rahul:`);
      createdHospitals.forEach(h => {
        console.log(`   - ${h.name} (${h.address.city}, ${h.address.pincode})`);
      });
    }

    console.log('\n✅ Migration completed!');
    console.log(`\n📍 Summary:`);
    console.log(`   Rahul's Address: ${rahulAddress.street}, ${rahulAddress.area}, ${rahulAddress.city} - ${rahulAddress.pincode}`);
    console.log(`   Blood Banks Added: ${bloodBanksToCreate.length}`);
    console.log(`   Hospitals Added: ${hospitalsToCreate.length}`);
    console.log(`\n🔑 Login Credentials:`);
    console.log(`   Blood Banks:`);
    bloodBanksToCreate.forEach(bb => {
      console.log(`     ${bb.email} / password123`);
    });
    console.log(`   Hospitals:`);
    hospitalsToCreate.forEach(h => {
      console.log(`     ${h.email} / password123`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

addNearbyFacilitiesForRahul();

