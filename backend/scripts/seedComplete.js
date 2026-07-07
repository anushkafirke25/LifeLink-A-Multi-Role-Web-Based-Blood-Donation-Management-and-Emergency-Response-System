// Complete seed data script for LifeLink
const mongoose = require('mongoose');
require('dotenv').config();

const User = require('../models/User');
const Inventory = require('../models/Inventory');
const Donation = require('../models/Donation');
const BloodRequest = require('../models/BloodRequest');

const connectDB = async () => {
  try {
    const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/lifelink';
    await mongoose.connect(uri);
    console.log('✅ MongoDB Connected');
  } catch (err) {
    console.error('❌ MongoDB connection failed:', err.message);
    process.exit(1);
  }
};

const clearDatabase = async () => {
  console.log('🗑️  Clearing existing data...');
  await User.deleteMany({});
  await Inventory.deleteMany({});
  await Donation.deleteMany({});
  await BloodRequest.deleteMany({});
  console.log('✅ Database cleared');
};

const seedData = async () => {
  try {
    await connectDB();
    await clearDatabase();

    console.log('🌱 Seeding data...\n');

    // 1. Create Blood Banks
    console.log('Creating blood banks...');
    const bloodBanks = await User.create([
      {
        name: 'City Central Blood Bank',
        email: 'central@bloodbank.com',
        password: 'password123',
        role: 'bloodbank',
        phone: '+91-98765-11111',
        location: 'Mumbai, Maharashtra',
        address: { street: 'MG Road', area: 'Andheri West', city: 'Mumbai', state: 'Maharashtra', pincode: '400058' },
        latitude: 19.1334,
        longitude: 72.8467
      },
      {
        name: 'Apollo Blood Center',
        email: 'apollo@bloodbank.com',
        password: 'password123',
        role: 'bloodbank',
        phone: '+91-98765-22222',
        location: 'Delhi, India',
        address: { street: 'Ring Road', area: 'Saket', city: 'Delhi', state: 'Delhi', pincode: '110017' },
        latitude: 28.5244,
        longitude: 77.1855
      },
      {
        name: 'Red Cross Blood Bank',
        email: 'redcross@bloodbank.com',
        password: 'password123',
        role: 'bloodbank',
        phone: '+91-98765-33333',
        location: 'Pune, Maharashtra',
        address: { street: 'FC Road', area: 'Shivajinagar', city: 'Pune', state: 'Maharashtra', pincode: '411005' },
        latitude: 18.5314,
        longitude: 73.8446
      }
    ]);
    console.log(`✅ Created ${bloodBanks.length} blood banks`);

    // 2. Create Inventory for each Blood Bank
    console.log('Creating blood inventory...');
    const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
    const inventoryItems = [];

    for (const bloodBank of bloodBanks) {
      for (const bloodType of bloodTypes) {
        inventoryItems.push({
          bloodBank: bloodBank._id,
          bloodType: bloodType,
          units: Math.floor(Math.random() * 50) + 10 // Random 10-60 units
        });
      }
    }

    await Inventory.insertMany(inventoryItems);
    console.log(`✅ Created ${inventoryItems.length} inventory items`);

    // 3. Create Donors
    console.log('Creating donors...');
    const donors = await User.create([
      {
        name: 'Rahul Sharma',
        email: 'rahul@donor.com',
        password: 'password123',
        role: 'donor',
        bloodType: 'O+',
        phone: '+91-98765-44444',
        address: { street: 'JM Road', area: 'Deccan', city: 'Pune', state: 'Maharashtra', pincode: '411004' },
        latitude: 18.5074,
        longitude: 73.8077
      },
      {
        name: 'Priya Patel',
        email: 'priya@donor.com',
        password: 'password123',
        role: 'donor',
        bloodType: 'A+',
        phone: '+91-98765-55555'
      },
      {
        name: 'Amit Kumar',
        email: 'amit@donor.com',
        password: 'password123',
        role: 'donor',
        bloodType: 'B+',
        phone: '+91-98765-66666'
      },
      {
        name: 'Sneha Reddy',
        email: 'sneha@donor.com',
        password: 'password123',
        role: 'donor',
        bloodType: 'AB+',
        phone: '+91-98765-77777'
      },
      {
        name: 'Vikram Singh',
        email: 'vikram@donor.com',
        password: 'password123',
        role: 'donor',
        bloodType: 'O-',
        phone: '+91-98765-88888'
      }
    ]);
    console.log(`✅ Created ${donors.length} donors`);

    // 4. Create Hospitals
    console.log('Creating hospitals...');
    const hospitals = await User.create([
      {
        name: 'City General Hospital',
        email: 'general@hospital.com',
        password: 'password123',
        role: 'hospital',
        phone: '+91-98765-99991',
        location: 'Mumbai, Maharashtra',
        address: { street: 'LBS Marg', area: 'Bhandup', city: 'Mumbai', state: 'Maharashtra', pincode: '400078' },
        latitude: 19.1543,
        longitude: 72.9312
      },
      {
        name: 'Apollo Multispecialty Hospital',
        email: 'apollo@hospital.com',
        password: 'password123',
        role: 'hospital',
        phone: '+91-98765-99992',
        location: 'Chennai, Tamil Nadu',
        address: { street: 'Greams Road', area: 'T Nagar', city: 'Chennai', state: 'Tamil Nadu', pincode: '600006' },
        latitude: 13.0418,
        longitude: 80.2341
      },
      {
        name: 'Fortis Healthcare',
        email: 'fortis@hospital.com',
        password: 'password123',
        role: 'hospital',
        phone: '+91-98765-99993',
        location: 'Bangalore, Karnataka',
        address: { street: 'Bannerghatta Road', area: 'Jayanagar', city: 'Bangalore', state: 'Karnataka', pincode: '560076' },
        latitude: 12.9250,
        longitude: 77.5937
      }
    ]);
    console.log(`✅ Created ${hospitals.length} hospitals`);

    // 5. Create Past Donations (giving each donor a realistic history)
    console.log('Creating donation records...');
    const donations = [];
    
    // Create multiple donations for each donor (3-6 completed donations per donor)
    donors.forEach(donor => {
      const numDonations = Math.floor(Math.random() * 4) + 3; // 3-6 donations
      
      for (let i = 0; i < numDonations; i++) {
        const randomBloodBank = bloodBanks[Math.floor(Math.random() * bloodBanks.length)];
        // Space out donations realistically (at least 60 days apart)
        const daysAgo = (i * 90) + Math.floor(Math.random() * 30) + 30; // 60-360 days ago
        
        donations.push({
          donor: donor._id,
          bloodBank: randomBloodBank._id,
          bloodType: donor.bloodType,
          units: 1,
          status: 'completed',
          donationDate: new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000)
        });
      }
    });

    // Create scheduled donations (future) for some donors
    for (let i = 0; i < 3; i++) {
      const randomDonor = donors[Math.floor(Math.random() * donors.length)];
      const randomBloodBank = bloodBanks[Math.floor(Math.random() * bloodBanks.length)];
      const daysAhead = Math.floor(Math.random() * 20) + 5; // 5-25 days ahead
      
      donations.push({
        donor: randomDonor._id,
        bloodBank: randomBloodBank._id,
        bloodType: randomDonor.bloodType,
        units: 1,
        status: 'scheduled',
        donationDate: new Date(Date.now() + daysAhead * 24 * 60 * 60 * 1000)
      });
    }

    await Donation.insertMany(donations);
    console.log(`✅ Created ${donations.length} donation records (${Math.floor(donations.length * 0.9)} completed, ${donations.length - Math.floor(donations.length * 0.9)} scheduled)`);

    // 6. Create Blood Requests
    console.log('Creating blood requests...');
    const bloodRequests = [
      {
        hospital: hospitals[0]._id,
        bloodType: 'O+',
        units: 5,
        priority: 'critical',
        status: 'pending',
        notes: 'Emergency surgery patient needs O+ blood urgently'
      },
      {
        hospital: hospitals[1]._id,
        bloodType: 'A-',
        units: 3,
        priority: 'urgent',
        status: 'pending',
        notes: 'Cancer patient requires A- blood for chemotherapy'
      },
      {
        hospital: hospitals[2]._id,
        bloodType: 'B+',
        units: 2,
        priority: 'regular',
        status: 'pending',
        notes: 'Post-surgery blood transfusion'
      },
      {
        hospital: hospitals[0]._id,
        bloodType: 'AB+',
        units: 4,
        priority: 'urgent',
        status: 'pending',
        notes: 'Accident victim needs AB+ blood'
      },
      {
        hospital: hospitals[1]._id,
        bloodType: 'O-',
        units: 6,
        priority: 'critical',
        status: 'pending',
        notes: 'Universal donor needed for multiple patients'
      }
    ];

    await BloodRequest.insertMany(bloodRequests);
    console.log(`✅ Created ${bloodRequests.length} blood requests`);

    // Print summary
    console.log('\n🎉 Seeding completed successfully!\n');
    console.log('📊 Summary:');
    console.log(`   - Blood Banks: ${bloodBanks.length}`);
    console.log(`   - Inventory Items: ${inventoryItems.length}`);
    console.log(`   - Donors: ${donors.length}`);
    console.log(`   - Hospitals: ${hospitals.length}`);
    console.log(`   - Donations: ${donations.length}`);
    console.log(`   - Blood Requests: ${bloodRequests.length}`);
    
    console.log('\n🔑 Test Credentials:');
    console.log('\n   Blood Banks:');
    bloodBanks.forEach(bb => console.log(`   - ${bb.email} / password123`));
    console.log('\n   Donors:');
    donors.forEach(d => console.log(`   - ${d.email} / password123`));
    console.log('\n   Hospitals:');
    hospitals.forEach(h => console.log(`   - ${h.email} / password123`));

    process.exit(0);
  } catch (err) {
    console.error('❌ Seeding failed:', err);
    process.exit(1);
  }
};

seedData();

