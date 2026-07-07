# Quick Test Guide - LifeLink New Features

## 🚀 Quick Start (5 Minutes)

### Step 1: Start Servers ✅

**Backend is already running!** ✅
```
✅ Server is running on port 5000
✅ MongoDB connected
```

**Start Frontend:**
```bash
cd E:\hattori\frontend
npm start
```

Wait for: `Compiled successfully!` message

---

## 🧪 Test Scenarios

### Test 1: Multilingual Support (2 minutes)

1. Open http://localhost:3000
2. Click 🌐 icon (top right)
3. Select **हिंदी** - entire page should translate
4. Select **मराठी** - page translates again
5. Select **English** - back to English
6. Refresh page - language should persist

**✅ Success:** All text changes language instantly

---

### Test 2: Modern UI Design (1 minute)

1. On home page, observe:
   - Animated gradient background
   - Rounded cards with shadows
   - Hover effects on cards (they lift up)
   
2. Click **Login**:
   - See modern rounded form
   - Notice smooth transitions
   - Check demo accounts section

**✅ Success:** Beautiful, modern design throughout

---

### Test 3: Event Management - Hospital (5 minutes)

#### Login as Hospital:
```
Email: general@hospital.com
Password: password123
```

#### Create Campaign:
1. Click **📅 Campaigns** tab
2. Click **Create Campaign** button
3. Fill form:
   ```
   Title: Blood Donation Drive 2026
   Description: Join us to save lives!
   Date: [Select tomorrow's date]
   Time: 10:00
   Location: Mumbai Central Hospital
   Contact: +91 98765 43210
   Requirements: Age 18-65, healthy donors
   ```
4. (Optional) Upload an image
5. Click **Save Campaign**

**✅ Success:** Campaign appears in the list with all details

#### View Registrations:
1. Click **View** button on your campaign
2. See modal with registration list (empty initially)
3. Click **📊 Export to Excel** button
4. Excel file downloads automatically

**✅ Success:** Modal opens, export works

---

### Test 4: Event Registration - Donor (3 minutes)

#### Login as Donor:
```
Email: rahul@donor.com
Password: password123
```

#### Register for Campaign:
1. Click **📅 Campaigns** tab
2. See the campaign you just created
3. Click **Register for Event →** button
4. Fill registration form:
   ```
   Name: Test Donor
   Email: test@donor.com
   Phone: +91 98765 43210
   Blood Type: O+
   Notes: First time donor
   ```
5. Click **Register**

**✅ Success:** "Registration successful!" alert appears

---

### Test 5: Verify Registration (2 minutes)

#### Switch back to Hospital:
1. Logout (if needed)
2. Login as `general@hospital.com`
3. Go to **Campaigns** tab
4. Click **View** on your campaign
5. See the new registration in the table:
   - Name: Test Donor
   - Email: test@donor.com
   - Blood Type: O+
   - Status: registered

6. Click **📊 Export to Excel**
7. Open the downloaded file
8. Verify donor data is in the spreadsheet

**✅ Success:** Registration visible, Excel export works!

---

## 🎯 Quick Feature Checklist

### Multilingual:
- [ ] Language switcher visible
- [ ] Can switch to Hindi
- [ ] Can switch to Marathi
- [ ] Language persists on reload

### Modern UI:
- [ ] Gradient backgrounds visible
- [ ] Cards are rounded
- [ ] Hover effects work
- [ ] Smooth animations

### Event Management:
- [ ] Can create campaign
- [ ] Can edit campaign
- [ ] Can view registrations
- [ ] Can export to Excel
- [ ] Can delete campaign

### Event Registration:
- [ ] Can browse campaigns
- [ ] Can register for event
- [ ] Registration appears in hospital view
- [ ] Cannot register twice (duplicate check)

---

## 🐛 Troubleshooting

### Issue: Language not changing
**Fix:** Hard refresh browser (Ctrl + Shift + R)

### Issue: Campaign not appearing
**Fix:** 
1. Check backend is running
2. Check browser console for errors
3. Try refreshing the page

### Issue: Image upload fails
**Fix:**
1. Check file size < 5MB
2. Ensure file is an image (jpg, png, etc.)
3. Check backend `uploads/` folder exists

### Issue: Excel export not working
**Fix:**
1. Check browser allows downloads
2. Look in Downloads folder
3. Check backend console for errors

---

## 📊 Expected Results

After all tests, you should have:

1. **Home Page:**
   - Beautiful gradient design
   - 3 feature cards
   - Language switcher working

2. **Hospital Dashboard:**
   - At least 1 campaign created
   - Campaign shows registration count
   - Excel export downloaded

3. **Donor Dashboard:**
   - Can see active campaigns
   - Successfully registered for 1 event
   - Donation history visible

4. **Database:**
   - 1 Event document
   - 1 EventRegistration document

---

## 🎉 Success Criteria

**All features working if:**
- ✅ Can switch languages smoothly
- ✅ UI looks modern and polished
- ✅ Can create and manage campaigns
- ✅ Donors can register for events
- ✅ Registrations visible to hospitals
- ✅ Excel export downloads successfully

---

## 📞 Quick Commands

**Stop Backend:**
```powershell
Get-Process | Where-Object {$_.ProcessName -eq "node"} | Stop-Process -Force
```

**Restart Backend:**
```powershell
cd E:\hattori\backend
npm start
```

**Start Frontend:**
```powershell
cd E:\hattori\frontend
npm start
```

**Check Backend Status:**
```
http://localhost:5000/api/health
```

---

## 🚀 You're All Set!

Your LifeLink platform now has:
- 🌍 3 languages (English, Hindi, Marathi)
- 🎨 Beautiful modern UI
- 📅 Complete event management
- 📊 Excel export functionality
- 🔄 Real-time synchronization

**Enjoy your upgraded platform!** 🎉

