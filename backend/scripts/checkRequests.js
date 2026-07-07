// Quick script to check blood requests in the database
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const BloodRequest = require('../models/BloodRequest');

dotenv.config();

const checkRequests = async () => {
  try {
    const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/lifelink';
    await mongoose.connect(uri);
    console.log('✅ Connected to MongoDB\n');
    
    const hospitalId = '69618ea7f273bc621c6d5a2d'; // Your hospital ID
    
    console.log('🔍 Checking requests for hospital ID:', hospitalId);
    console.log('Hospital ID type:', typeof hospitalId);
    
    // Try different query methods
    console.log('\n1️⃣ Query as string:');
    const requestsAsString = await BloodRequest.find({ hospital: hospitalId }).lean();
    console.log(`Found ${requestsAsString.length} requests`);
    
    console.log('\n2️⃣ Query as ObjectId:');
    const requestsAsObjectId = await BloodRequest.find({ hospital: mongoose.Types.ObjectId(hospitalId) }).lean();
    console.log(`Found ${requestsAsObjectId.length} requests`);
    
    console.log('\n3️⃣ All requests in database:');
    const allRequests = await BloodRequest.find().limit(5).lean();
    console.log(`Total requests in DB: ${await BloodRequest.countDocuments()}`);
    console.log('Sample requests:');
    allRequests.forEach(r => {
      console.log(`  - ID: ${r._id}, Hospital: ${r.hospital}, Type: ${typeof r.hospital}, Blood: ${r.bloodType}`);
    });
    
    console.log('\n4️⃣ Direct comparison:');
    const testRequest = allRequests[0];
    if (testRequest) {
      console.log('Test request hospital ID:', testRequest.hospital);
      console.log('Test request hospital ID type:', typeof testRequest.hospital);
      console.log('Your hospital ID:', hospitalId);
      console.log('String comparison:', testRequest.hospital.toString() === hospitalId);
      console.log('Direct comparison:', testRequest.hospital == hospitalId);
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n👋 Connection closed');
  }
};

checkRequests();

