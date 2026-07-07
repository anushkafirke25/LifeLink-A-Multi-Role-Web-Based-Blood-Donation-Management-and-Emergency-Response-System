const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');
const { Donation, BloodRequest, Inventory } = require('../models/Donation');

// Load environment variables
dotenv.config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ MongoDB Connected');
  } catch (error) {
    console.error('❌ MongoDB Connection Error:', error);
    process.exit(1);
  }
};

const seedData = async () => {
  try {
    // Clear existing data
    console.log('🗑️  Clearing existing data...');
    await User.deleteMany({});
    await Donation.deleteMany({});
    await BloodRequest.deleteMany({});
    await Inventory.deleteMany({});
    console.log('✅ Existing data cleared');

    // Create Donors
    console.log('👥 Creating donors...');
    const donors = await User.create([
      {
        name: 'Rahul Sharma',
        email: 'rahul@example.com',
        password: 'password123',
        role: 'donor',
        bloodType: 'O+',
        phone: '+91-9876543210',
        location: {
          city: 'Pune',
          state: 'Maharashtra',
          address: '123 MG Road'
        },
        donorProfile: {
          totalDonations: 12,
          lastDonationDate: new Date('2024-08-15'),
          isEligible: false
        }
      },
      {
        name: 'Priya Patel',
        email: 'priya@example.com',
        password: 'password123',
        role: 'donor',
        bloodType: 'A+',
        phone: '+91-9876543211',
        location: {
          city: 'Mumbai',
          state: 'Maharashtra'
        },
        donorProfile: {
          totalDonations: 8,
          lastDonationDate: new Date('2024-07-10'),
          isEligible: true
        }
      },
      {
        name: 'Amit Kumar',
        email: 'amit@example.com',
        password: 'password123',
        role: 'donor',
        bloodType: 'B+',
        phone: '+91-9876543212',
        location: {
          city: 'Pune',
          state: 'Maharashtra'
        },
        donorProfile: {
          totalDonations: 5,
          lastDonationDate: new Date('2024-09-01'),
          isEligible: true
        }
      },
      {
        name: 'Sneha Desai',
        email: 'sneha@example.com',
        password: 'password123',
        role: 'donor',
        bloodType: 'O-',
        phone: '+91-9876543213',
        location: {
          city: 'Mumbai',
          state: 'Maharashtra'
        },
        donorProfile: {
          totalDonations: 15,
          lastDonationDate: new Date('2024-06-20'),
          isEligible: true
        }
      },
      {
        name: 'Rajesh Mehta',
        email: 'rajesh@example.com',
        password: 'password123',
        role: 'donor',
        bloodType: 'AB+',
        phone: '+91-9876543214',
        location: {
          city: 'Pune',
          state: 'Maharashtra'
        },
        donorProfile: {
          totalDonations: 3,
          lastDonationDate: new Date('2024-10-05'),
          isEligible: false
        }
      }
    ]);
    console.log(`✅ Created ${donors.length} donors`);

    // Create Hospitals
    console.log('🏥 Creating hospitals...');
    const hospitals = await User.create([
      {
        name: 'Apollo Hospital',
        email: 'admin@apollo.com',
        password: 'password123',
        role: 'hospital',
        phone: '+91-9876543220',
        location: {
          city: 'Pune',
          state: 'Maharashtra',
          address: 'Baner Road'
        },
        hospitalProfile: {
          registrationNumber: 'HOS-2024-001',
          totalBeds: 500,
          emergencyServices: true,
          departments: ['Emergency', 'Surgery', 'ICU', 'Blood Bank']
        }
      },
      {
        name: 'Fortis Hospital',
        email: 'admin@fortis.com',
        password: 'password123',
        role: 'hospital',
        phone: '+91-9876543221',
        location: {
          city: 'Mumbai',
          state: 'Maharashtra',
          address: 'Mulund West'
        },
        hospitalProfile: {
          registrationNumber: 'HOS-2024-002',
          totalBeds: 350,
          emergencyServices: true,
          departments: ['Emergency', 'Cardiology', 'Neurology']
        }
      },
      {
        name: 'Max Hospital',
        email: 'admin@max.com',
        password: 'password123',
        role: 'hospital',
        phone: '+91-9876543222',
        location: {
          city: 'Pune',
          state: 'Maharashtra',
          address: 'Kothrud'
        },
        hospitalProfile: {
          registrationNumber: 'HOS-2024-003',
          totalBeds: 400,
          emergencyServices: true,
          departments: ['Emergency', 'Oncology', 'Orthopedics']
        }
      }
    ]);
    console.log(`✅ Created ${hospitals.length} hospitals`);

    // Create Blood Banks
    console.log('🩸 Creating blood banks...');
    const bloodBanks = await User.create([
      {
        name: 'City Blood Bank',
        email: 'admin@cityblood.com',
        password: 'password123',
        role: 'bloodbank',
        phone: '+91-9876543230',
        location: {
          city: 'Pune',
          state: 'Maharashtra',
          address: 'Shivaji Nagar'
        },
        bloodBankProfile: {
          licenseNumber: 'BB-2024-001',
          storageCapacity: 1000,
          certifications: ['ISO 9001', 'NABH'],
          operatingHours: {
            open: '08:00 AM',
            close: '08:00 PM'
          }
        }
      },
      {
        name: 'Central Blood Bank',
        email: 'admin@centralblood.com',
        password: 'password123',
        role: 'bloodbank',
        phone: '+91-9876543231',
        location: {
          city: 'Mumbai',
          state: 'Maharashtra',
          address: 'Dadar'
        },
        bloodBankProfile: {
          licenseNumber: 'BB-2024-002',
          storageCapacity: 1500,
          certifications: ['ISO 9001', 'NABH', 'CAP'],
          operatingHours: {
            open: '24/7',
            close: '24/7'
          }
        }
      }
    ]);
    console.log(`✅ Created ${bloodBanks.length} blood banks`);

    // Create Blood Inventory for Blood Banks
    console.log('📦 Creating blood inventory...');
    const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
    
    for (const bloodBank of bloodBanks) {
      const inventoryItems = bloodTypes.map(bloodType => ({
        bloodBank: bloodBank._id,
        bloodType,
        totalUnits: Math.floor(Math.random() * 200) + 50,
        availableUnits: Math.floor(Math.random() * 150) + 20,
        reservedUnits: Math.floor(Math.random() * 20),
        expiringUnits: Math.floor(Math.random() * 10),
        batches: [
          {
            batchNumber: `BATCH-${bloodType}-${Math.floor(Math.random() * 1000)}`,
            units: Math.floor(Math.random() * 50) + 10,
            collectionDate: new Date(),
            expiryDate: new Date(Date.now() + 35 * 24 * 60 * 60 * 1000), // 35 days from now
            donorId: donors[Math.floor(Math.random() * donors.length)]._id
          }
        ]
      }));
      
      await Inventory.create(inventoryItems);
    }
    console.log('✅ Blood inventory created');

    // Create Blood Requests
    console.log('📝 Creating blood requests...');
    const priorities = ['critical', 'urgent', 'regular'];
    const statuses = ['pending', 'approved', 'fulfilled'];
    
    const bloodRequestsData = [];
    for (let i = 0; i < 15; i++) {
      bloodRequestsData.push({
        hospital: hospitals[Math.floor(Math.random() * hospitals.length)]._id,
        bloodType: bloodTypes[Math.floor(Math.random() * bloodTypes.length)],
        units: Math.floor(Math.random() * 5) + 1,
        priority: priorities[Math.floor(Math.random() * priorities.length)],
        status: statuses[Math.floor(Math.random() * statuses.length)],
        patientDetails: {
          name: `Patient ${i + 1}`,
          age: Math.floor(Math.random() * 60) + 20,
          condition: ['Surgery', 'Accident', 'Cancer Treatment', 'Anemia'][Math.floor(Math.random() * 4)]
        },
        requiredBy: new Date(Date.now() + Math.random() * 7 * 24 * 60 * 60 * 1000), // Within next 7 days
        notes: 'Emergency requirement',
        createdAt: new Date(Date.now() - Math.random() * 48 * 60 * 60 * 1000) // Within last 48 hours
      });
    }
    
    await BloodRequest.create(bloodRequestsData);
    console.log(`✅ Created ${bloodRequestsData.length} blood requests`);

    // Create Donations
    console.log('💉 Creating donation records...');
    const donationStatuses = ['scheduled', 'completed', 'cancelled'];
    
    const donationsData = [];
    for (let i = 0; i < 25; i++) {
      const donor = donors[Math.floor(Math.random() * donors.length)];
      const bloodBank = bloodBanks[Math.floor(Math.random() * bloodBanks.length)];
      const status = donationStatuses[Math.floor(Math.random() * donationStatuses.length)];
      
      donationsData.push({
        donor: donor._id,
        bloodBank: bloodBank._id,
        bloodType: donor.bloodType,
        units: 1,
        status: status,
        donationDate: new Date(Date.now() - Math.random() * 180 * 24 * 60 * 60 * 1000), // Within last 6 months
        location: bloodBank.name,
        notes: status === 'completed' ? 'Donation successful' : 'Scheduled donation',
        testResults: status === 'completed' ? {
          hemoglobin: 13 + Math.random() * 3,
          bloodPressure: '120/80',
          weight: 60 + Math.random() * 30,
          isPassed: true
        } : undefined
      });
    }
    
    await Donation.create(donationsData);
    console.log(`✅ Created ${donationsData.length} donation records`);

    console.log('\n🎉 Database seeded successfully!');
    console.log('\n📊 Summary:');
    console.log(`   Donors: ${donors.length}`);
    console.log(`   Hospitals: ${hospitals.length}`);
    console.log(`   Blood Banks: ${bloodBanks.length}`);
    console.log(`   Blood Requests: ${bloodRequestsData.length}`);
    console.log(`   Donations: ${donationsData.length}`);
    console.log(`   Inventory Items: ${bloodTypes.length * bloodBanks.length}`);
    
    console.log('\n🔑 Sample Login Credentials:');
    console.log('   Donor: rahul@example.com / password123');
    console.log('   Hospital: admin@apollo.com / password123');
    console.log('   Blood Bank: admin@cityblood.com / password123');

  } catch (error) {
    console.error('❌ Error seeding data:', error);
  } finally {
    mongoose.connection.close();
    console.log('\n👋 Database connection closed');
  }
};

// Run the seed function
connectDB().then(() => {
  seedData();
});