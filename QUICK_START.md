# 🚀 LifeLink - Quick Start Guide

## ⚡ Get Started in 3 Minutes!

### **Step 1: Seed Database** (30 seconds)
```bash
cd backend
npm run seed
```

✅ Creates 3 blood banks, 5 donors, 3 hospitals, and test data

---

### **Step 2: Start Backend** (10 seconds)
```bash
cd backend
npm start
```

✅ Backend running on `http://localhost:5000`

---

### **Step 3: Start Frontend** (10 seconds)
```bash
cd frontend
npm start
```

✅ Frontend running on `http://localhost:3000`

---

## 🎯 Quick Test

### **Test Real-Time Sync:**

1. Open browser: `http://localhost:3000`
2. Click **"Login"**
3. Login as Blood Bank:
   - Email: `central@bloodbank.com`
   - Password: `password123`
4. Click **"+ Update Inventory"**
5. Select **A+**, enter **50** units, click **Update**
6. Open new tab, login as Hospital:
   - Email: `general@hospital.com`
   - Password: `password123`
7. Watch A+ blood update to 50 units **within 5 seconds!** ✨

---

## 🔑 Quick Login Credentials

| Role | Email | Password |
|------|-------|----------|
| **Blood Bank** | central@bloodbank.com | password123 |
| **Donor** | rahul@donor.com | password123 |
| **Hospital** | general@hospital.com | password123 |

---

## ✨ Key Features to Try

### **Hospital Dashboard:**
- ✅ View blood inventory from all blood banks
- ✅ Search by location
- ✅ Filter by blood type
- ✅ Create blood request (click "+ New Blood Request")
- ✅ See low inventory notifications

### **Donor Dashboard:**
- ✅ View emergency blood requests
- ✅ See donation history
- ✅ Get urgent request notifications

### **Blood Bank Dashboard:**
- ✅ Update blood inventory
- ✅ View pending donors
- ✅ See hospital requests
- ✅ Get pending action notifications

---

## 🔄 Real-Time Sync

**All dashboards auto-refresh every 5 seconds!**

When you:
- Update inventory in Blood Bank → Hospital sees it in 5 sec
- Create request in Hospital → Donor sees it in 5 sec
- No page refresh needed! ✨

---

## 📚 More Info

- **Full Testing Guide:** See `TESTING_GUIDE.md`
- **Implementation Details:** See `IMPLEMENTATION_SUMMARY.md`

---

**That's it! You're ready to go! 🎉**
