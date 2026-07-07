# 🧪 LifeLink Testing Guide

## 🚀 Quick Start

### 1. **Seed the Database** (IMPORTANT - Do this first!)

```bash
cd backend
npm run seed
```

This will create:
- ✅ 3 Blood Banks with full inventory (all blood types)
- ✅ 5 Donors with donation history
- ✅ 3 Hospitals
- ✅ 20 Donation records (past and scheduled)
- ✅ 5 Blood Requests (various priorities)

### 2. **Start Backend**

```bash
cd backend
npm start
```

Backend will run on: `http://localhost:5000`

### 3. **Start Frontend**

```bash
cd frontend
npm start
```

Frontend will run on: `http://localhost:3000`

---

## 🧪 Test Scenarios

### **Test 1: Landing Page & Navigation**

1. ✅ Open `http://localhost:3000`
2. ✅ Verify you see the **Home page** (not login page)
3. ✅ Check navigation bar has "Login" and "Register" buttons
4. ✅ Verify hero section displays "Save Lives Through Blood Donation"
5. ✅ Check 3 feature cards are displayed

---

### **Test 2: Hospital Dashboard - Real-Time Inventory**

#### Login as Hospital:
- Email: `general@hospital.com`
- Password: `password123`

#### What to Test:
1. ✅ **View Inventory** - Should see blood inventory from all 3 blood banks
2. ✅ **Search Filter** - Type "Apollo" in search box → filters by blood bank name
3. ✅ **Blood Type Filter** - Select "O+" → shows only O+ blood
4. ✅ **Clear Filters** - Click "Clear Filters" → shows all again
5. ✅ **Real-Time Sync** - Data auto-refreshes every 5 seconds
6. ✅ **Notification Badge** - Shows count if blood types are running low (<10 units)

#### Create Blood Request:
1. ✅ Click **"+ New Blood Request"** button
2. ✅ Fill form:
   - Blood Type: O+
   - Units: 5
   - Priority: Critical
   - Notes: "Emergency surgery patient"
3. ✅ Click "Submit Request"
4. ✅ Verify success message

---

### **Test 3: Donor Dashboard - Emergency Requests**

#### Login as Donor:
- Email: `rahul@donor.com`
- Password: `password123`

#### What to Test:
1. ✅ **View Profile** - Check stats (Total Donations, Blood Type, Lives Saved)
2. ✅ **Emergency Requests** - Should see 5 blood requests with details
3. ✅ **Notification Badge** - Red badge showing number of emergency requests
4. ✅ **Donation History** - Table showing past donations
5. ✅ **Real-Time Sync** - Data auto-refreshes every 5 seconds

---

### **Test 4: Blood Bank Dashboard - Inventory Management**

#### Login as Blood Bank:
- Email: `central@bloodbank.com`
- Password: `password123`

#### What to Test:
1. ✅ **View Stats** - Total Units, Pending Donors, Hospital Requests
2. ✅ **Blood Inventory Table** - Shows all 8 blood types with status indicators
3. ✅ **Status Colors**:
   - Green (Good): >10 units
   - Yellow (Low): 6-10 units
   - Red (Critical): <5 units

#### Update Inventory:
1. ✅ Click **"+ Update Inventory"** button
2. ✅ Select Blood Type: A+
3. ✅ Enter Units: 25
4. ✅ Click "Update"
5. ✅ Verify inventory updates immediately
6. ✅ Switch to Hospital dashboard → verify hospital sees updated inventory within 5 seconds

#### View Pending Donors & Requests:
1. ✅ **Pending Donors Section** - Shows scheduled donations
2. ✅ **Hospital Requests Section** - Shows critical/urgent requests
3. ✅ **Notification Badge** - Blue badge showing pending actions
4. ✅ **Real-Time Sync** - Data auto-refreshes every 5 seconds

---

### **Test 5: Data Synchronization (CRITICAL)**

#### Real-Time Test:
1. ✅ Open 2 browser windows side-by-side
2. ✅ Window 1: Login as **Blood Bank** (`central@bloodbank.com`)
3. ✅ Window 2: Login as **Hospital** (`general@hospital.com`)
4. ✅ In Blood Bank window: Update A+ blood to 50 units
5. ✅ In Hospital window: Watch inventory table update **within 5 seconds**
6. ✅ Verify the A+ blood shows 50 units automatically

---

### **Test 6: Role-Based Authentication**

#### Test Each Role:
1. ✅ **Donor Login** → Redirects to `/donor` dashboard
2. ✅ **Hospital Login** → Redirects to `/hospital` dashboard
3. ✅ **Blood Bank Login** → Redirects to `/bloodbank` dashboard
4. ✅ Logout → Redirects to Home page

---

## 📋 Test Credentials

### Blood Banks:
```
Email: central@bloodbank.com     | Password: password123
Email: apollo@bloodbank.com      | Password: password123
Email: redcross@bloodbank.com    | Password: password123
```

### Donors:
```
Email: rahul@donor.com   (O+)    | Password: password123
Email: priya@donor.com   (A+)    | Password: password123
Email: amit@donor.com    (B+)    | Password: password123
Email: sneha@donor.com   (AB+)   | Password: password123
Email: vikram@donor.com  (O-)    | Password: password123
```

### Hospitals:
```
Email: general@hospital.com      | Password: password123
Email: apollo@hospital.com       | Password: password123
Email: fortis@hospital.com       | Password: password123
```

---

## ✅ Expected Results Summary

| Feature | Status | Evidence |
|---------|--------|----------|
| Home Page Loads First | ✅ | Landing page shows, not login |
| Role-Based Login | ✅ | Correct dashboard per role |
| Hospital View Inventory | ✅ | All blood banks inventory visible |
| Hospital Search/Filter | ✅ | Filters work correctly |
| Hospital Create Request | ✅ | Form submission successful |
| Donor View Requests | ✅ | Emergency requests displayed |
| Donor View History | ✅ | Past donations shown |
| Blood Bank View Inventory | ✅ | Own inventory displayed |
| Blood Bank Update Inventory | ✅ | Can modify blood units |
| Blood Bank View Requests | ✅ | Hospital requests visible |
| **Real-Time Sync** | ✅ | **All dashboards auto-refresh every 5 seconds** |
| Notification Badges | ✅ | Show counts for urgent items |

---

## 🐛 Troubleshooting

### Problem: "No inventory available"
**Solution:** Run `npm run seed` in backend folder

### Problem: Login redirects to blank page
**Solution:** Hard refresh browser (Ctrl+Shift+R)

### Problem: Data not updating
**Solution:** Check backend is running on port 5000

### Problem: "Cannot connect to database"
**Solution:** Check MongoDB connection string in `.env` file

---

## 🎯 Key Features to Highlight

1. ✨ **Real-Time Synchronization** - All dashboards refresh every 5 seconds
2. 🔍 **Smart Search & Filter** - Hospital can find blood by type/location
3. 📊 **Live Inventory Management** - Blood banks can update units instantly
4. 🚨 **Emergency Notifications** - Visual badges for urgent items
5. 📝 **Blood Request Creation** - Hospitals can request blood with priority
6. 🎨 **Beautiful UI** - Modern, responsive Tailwind CSS design
7. 🔐 **Role-Based Access** - Separate dashboards for each user type

---

## 📸 Screenshots to Verify

- [ ] Home page with hero section
- [ ] Hospital dashboard with inventory table
- [ ] Search and filter working
- [ ] Blood request form
- [ ] Donor dashboard with emergency requests
- [ ] Blood bank inventory management
- [ ] Notification badges visible
- [ ] Real-time updates happening

---

**Happy Testing! 🎉**
