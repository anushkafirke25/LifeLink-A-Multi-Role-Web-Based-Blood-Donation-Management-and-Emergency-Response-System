const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');
const Donation = require('../models/Donation');
const Inventory = require('../models/Inventory');
const BloodRequest = require('../models/BloodRequest');

dotenv.config();

async function run() {
  const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/lifelink';
  await mongoose.connect(uri);

  await Promise.all([
    Donation.deleteMany({}),
    Inventory.deleteMany({}),
    BloodRequest.deleteMany({})
  ]);

  // Create users
  const [donor1, donor2, hospital1, bank1] = await User.create([
    { name: 'Rahul Sharma', email: 'rahul@example.com', password: 'password123', role: 'donor', bloodType: 'O+', phone: '+91-9876543210' },
    { name: 'Priya Patel', email: 'priya@example.com', password: 'password123', role: 'donor', bloodType: 'A+', phone: '+91-9876543211' },
    { name: 'Apollo Hospital', email: 'admin@apollo.com', password: 'password123', role: 'hospital', phone: '+91-9876543220' },
    { name: 'City Blood Bank', email: 'admin@cityblood.com', password: 'password123', role: 'bloodbank', phone: '+91-9876543230' }
  ]);

  // Seed inventory for bank1
  const bloodTypes = ['A+','A-','B+','B-','AB+','AB-','O+','O-'];
  await Inventory.insertMany(bloodTypes.map(bt => ({ bloodBank: bank1._id, bloodType: bt, units: Math.floor(Math.random()*10)+2 })));

  // Seed requests
  await BloodRequest.insertMany([
    { hospital: hospital1._id, bloodType: 'O+', units: 2, priority: 'urgent' },
    { hospital: hospital1._id, bloodType: 'A+', units: 1, priority: 'regular' }
  ]);

  // Seed donations (one completed, one scheduled)
  const d1 = await Donation.create({ donor: donor1._id, bloodBank: bank1._id, bloodType: donor1.bloodType, units: 1, status: 'completed', notes: 'Seed complete' });
  const d2 = await Donation.create({ donor: donor2._id, bloodBank: bank1._id, bloodType: donor2.bloodType, units: 1, status: 'scheduled', notes: 'Seed scheduled' });

  // Reflect completed donation into inventory
  await Inventory.findOneAndUpdate({ bloodBank: bank1._id, bloodType: donor1.bloodType }, { $inc: { units: d1.units } }, { upsert: true });

  console.log('✅ Seed completed');
  console.log('🔑 Logins:');
  console.log('   Donor: rahul@example.com / password123');
  console.log('   Hospital: admin@apollo.com / password123');
  console.log('   Blood Bank: admin@cityblood.com / password123');

  await mongoose.disconnect();
}

run().catch((e) => { console.error(e); process.exit(1); });


