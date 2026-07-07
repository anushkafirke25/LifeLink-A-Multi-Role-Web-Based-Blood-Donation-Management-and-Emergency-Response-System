# 🗄️ MongoDB Seed Guide for LifeLink

## ✅ What This Does

The seed script will populate your **LOCAL MongoDB database** with realistic test data:

- ✅ 3 Blood Banks (City Central, Apollo, Red Cross)
- ✅ 24 Inventory items (8 blood types × 3 banks)
- ✅ 5 Donors with different blood types
- ✅ 3 Hospitals
- ✅ 20 Donation records (15 completed, 5 scheduled)
- ✅ 5 Blood Requests (critical, urgent, regular)

---

## 🚀 How to Run

### **Step 1: Make sure MongoDB is running**

Check if MongoDB is running on your system:
```bash
# Windows
net start MongoDB

# Mac/Linux
brew services start mongodb-community
# OR
sudo systemctl start mongod
```

### **Step 2: Verify your .env file**

Make sure `backend/.env` has your MongoDB connection:
```
MONGO_URI=mongodb://localhost:27017/lifelink
PORT=5000
```

### **Step 3: Run the seed script**

```bash
cd backend
npm run seed
```

You should see:
```
✅ MongoDB Connected
🗑️  Clearing existing data...
✅ Database cleared
🌱 Seeding data...

Creating blood banks...
✅ Created 3 blood banks

Creating blood inventory...
✅ Created 24 inventory items

Creating donors...
✅ Created 5 donors

Creating hospitals...
✅ Created 3 hospitals

Creating donation records...
✅ Created 20 donation records

Creating blood requests...
✅ Created 5 blood requests

🎉 Seeding completed successfully!

📊 Summary:
   - Blood Banks: 3
   - Inventory Items: 24
   - Donors: 5
   - Hospitals: 3
   - Donations: 20
   - Blood Requests: 5

🔑 Test Credentials:

   Blood Banks:
   - central@bloodbank.com / password123
   - apollo@bloodbank.com / password123
   - redcross@bloodbank.com / password123

   Donors:
   - rahul@donor.com / password123
   - priya@donor.com / password123
   - amit@donor.com / password123
   - sneha@donor.com / password123
   - vikram@donor.com / password123

   Hospitals:
   - general@hospital.com / password123
   - apollo@hospital.com / password123
   - fortis@hospital.com / password123
```

---

## 🧪 Verify Data Was Created

### **Option 1: Use MongoDB Compass**
1. Open MongoDB Compass
2. Connect to `mongodb://localhost:27017`
3. Click on `lifelink` database
4. Check collections: users, inventories, donations, bloodrequests

### **Option 2: Use MongoDB Shell**
```bash
mongo
use lifelink
db.users.count()  // Should show 11 users (3 banks + 5 donors + 3 hospitals)
db.inventories.count()  // Should show 24 items
db.donations.count()  // Should show 20 donations
db.bloodrequests.count()  // Should show 5 requests
```

### **Option 3: Test in the App**
1. Start backend: `cd backend && npm start`
2. Start frontend: `cd frontend && npm start`
3. Login as hospital: `general@hospital.com` / `password123`
4. You should see blood inventory from all 3 blood banks!

---

## 🔄 Re-run to Reset Data

The seed script **clears all existing data** before adding new data. So you can run it anytime to reset:

```bash
cd backend
npm run seed
```

---

## ⚠️ Troubleshooting

### **Error: "MongoDB connection failed"**
- Check if MongoDB is running: `mongo --version`
- Verify connection string in `.env` file
- Try: `mongodb://127.0.0.1:27017/lifelink` instead of localhost

### **Error: "Cannot find module"**
```bash
cd backend
npm install
npm run seed
```

### **Error: "User validation failed"**
- Delete the database and try again:
```bash
mongo
use lifelink
db.dropDatabase()
exit
```
Then run seed again.

---

## 📊 What Gets Created

### **Blood Banks:**
| Name | Email | Phone | Inventory |
|------|-------|-------|-----------|
| City Central Blood Bank | central@bloodbank.com | +91-98765-11111 | 8 types |
| Apollo Blood Center | apollo@bloodbank.com | +91-98765-22222 | 8 types |
| Red Cross Blood Bank | redcross@bloodbank.com | +91-98765-33333 | 8 types |

### **Donors:**
| Name | Email | Blood Type | Phone |
|------|-------|------------|-------|
| Rahul Sharma | rahul@donor.com | O+ | +91-98765-44444 |
| Priya Patel | priya@donor.com | A+ | +91-98765-55555 |
| Amit Kumar | amit@donor.com | B+ | +91-98765-66666 |
| Sneha Reddy | sneha@donor.com | AB+ | +91-98765-77777 |
| Vikram Singh | vikram@donor.com | O- | +91-98765-88888 |

### **Hospitals:**
| Name | Email | Phone |
|------|-------|-------|
| City General Hospital | general@hospital.com | +91-98765-99991 |
| Apollo Multispecialty | apollo@hospital.com | +91-98765-99992 |
| Fortis Healthcare | fortis@hospital.com | +91-98765-99993 |

### **Blood Inventory Sample:**
Each blood bank has random units (10-60) of each type:
- A+, A-, B+, B-, AB+, AB-, O+, O-

### **Blood Requests Sample:**
- O+ - 5 units - Critical (Emergency surgery)
- A- - 3 units - Urgent (Cancer patient)
- B+ - 2 units - Regular (Post-surgery)
- AB+ - 4 units - Urgent (Accident victim)
- O- - 6 units - Critical (Universal donor needed)

---

## ✅ After Seeding

1. ✅ **Start Backend:**
```bash
cd backend
npm start
```

2. ✅ **Start Frontend:**
```bash
cd frontend
npm start
```

3. ✅ **Test the Features:**
   - Login as Hospital → See ALL blood banks' inventory
   - Login as Blood Bank → See ALL hospital requests
   - Login as Donor → See donation history
   - Create a blood request as Hospital → See it appear in Blood Bank dashboard
   - Update inventory as Blood Bank → See it update in Hospital dashboard

---

**Your MongoDB is now populated with realistic test data! 🎉**
