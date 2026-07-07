# LifeLink - Blood Donation Management System
## Complete Project Documentation (Hinglish)
### For Project Defense & Evaluation – Zero Technical Background Assumed

---

## How to Read This Document

This documentation is written for someone who has **no prior knowledge of web development**. You may not know what HTML, CSS, JavaScript, or databases are – that is completely fine. Every concept is explained in simple language with full paragraphs. The goal is to prove that the team fully understands how and why the project works, and can answer any question from an external evaluator during project defense.

---

# PART 1: FEATURE OVERVIEW (WITHOUT CODE)

---

## 1.1 What Is This Project About?

**LifeLink** ek Blood Donation Management System hai. Simple words mein, ye ek website hai jahan:

- **Donors** (blood donate karne wale) apna donation track kar sakte hain, nearby blood banks dekh sakte hain, aur emergency blood requests ko respond kar sakte hain.
- **Hospitals** blood ki requests create kar sakte hain, nearby blood banks ka inventory dekh sakte hain, aur blood donation campaigns organize kar sakte hain.
- **Blood Banks** apna blood inventory manage kar sakte hain, donors ko appointments de sakte hain, aur hospital requests ko fulfill kar sakte hain.

Ye teeno types ke users ek hi system se connected hain. Agar kisi hospital ko blood chahiye, to wo request create karti hai; donors us request ko dekh kar respond karte hain; blood bank donation record karti hai aur inventory update karti hai. Sab real-time synchronized rehta hai.

---

## 1.2 Who Are The Users?

Project me teen types ke users hain:

1. **Donor:** Woh person jo blood donate karta hai. Donor register karte waqt apna blood type (A+, B+, O+, etc.) select karta hai. Donor ko emergency requests dikhti hain jo uske blood type ke liye hain, donation history, aur certificate download karne ka option.

2. **Hospital:** Hospitals blood ki demand create karti hain. Wo nearby blood banks ka inventory dekh sakti hain, blood request create karti hain (jaise “O+ blood, 3 units, urgent”), aur blood donation campaigns (events) organize karti hain.

3. **Blood Bank:** Blood banks donors se blood collect karti hain, inventory maintain karti hain, hospital requests ko approve karti hain, aur donors ko reminders/appointments bhejti hain.

---

## 1.3 Login & Registration – Feature Explanation

### What It Does

Login aur Registration woh screens hain jahan user apna account banata hai ya existing account se andar aata hai. Registration pe user apna naam, email, password, phone number, aur role (Donor / Hospital / Blood Bank) select karta hai. Agar Donor select kiya to blood type bhi choose karna padta hai. Agar Blood Bank select kiya to optional signature image upload kar sakte hain jo certificate pe dikhegi.

Login pe user sirf email aur password daalta hai. System check karta hai ki ye credentials sahi hain ya nahi. Agar sahi hain to user ko uske role ke hisaab se correct dashboard pe bhej diya jata hai.

### Why It Exists

Bina login/registration ke system ko pata nahi chalega user kaun hai, kya role hai, aur kya data dikhana hai. Har user ka apna dashboard hota hai – donor ko donor ka view, hospital ko hospital ka view. Isliye pehle identify karna zaroori hai.

### How Users Interact

User pehle website open karta hai. Home page pe “Login” ya “Register” buttons dikhte hain. Register pe click karke form bharta hai aur submit karta hai. System backend pe data bhejta hai, naya user create hota hai, aur user turant uske dashboard pe redirect ho jata hai. Login pe email-password daalne ke baad bhi same – sahi credentials hone par dashboard pe redirect.

---

## 1.4 Donor Dashboard – Feature Explanation

### What It Does

Donor dashboard pe donor ko teen main tabs milte hain:

**Overview Tab:** Yahan donor ko apne total donations ki count, blood type, aur “lives saved” (donation count) dikhai deti hai. Emergency blood requests list hoti hai – jo uske blood type ke liye hain. Donor in requests pe “Respond” kar sakta hai (available date/time bata kar). Donation history table hoti hai jahan past donations list hoti hain, aur completed donations ke liye “Certificate” button hota hai. Eligibility countdown bhi hota hai – jaise “84 days remaining until you can donate again” ya “You are eligible to donate.”

**Nearby Tab:** Yahan donor ko nearby blood banks aur hospitals ki list dikhai deti hai. “Use my location” button se browser user ki current location (GPS) use karta hai, aur distance ke hisaab se nearest facilities dikhata hai. Agar address profile me hai to bina GPS ke bhi distance approximate calculate ho sakti hai.

**Events Tab:** Yahan upcoming blood donation campaigns list hoti hain. Donor kisi bhi event pe register kar sakta hai.

### Why It Exists

Donor ko ek jagah se sab kuch dikhna chahiye – requests, history, nearby facilities, events. Ye central hub hai jahan donor apna blood donation journey track karta hai.

### How Users Interact

Donor login karte hi donor dashboard open hota hai. Tabs pe click karke Overview, Nearby, ya Events switch karta hai. Emergency request pe “Respond” pe click karke form bharta hai. Donation history me completed donation ke saamne “Certificate” pe click karke certificate download/print karta hai. Profile update button se naam, phone, address change kar sakta hai.

---

## 1.5 Blood Bank Dashboard – Feature Explanation

### What It Does

Blood bank dashboard pe blood bank ko:

- **Inventory:** Current blood stock (A+, B+, O+, etc. ke units) dekhna aur update karna.
- **Record Donation:** Naya donation record karna – existing donor search karke ya naya donor add karke.
- **Eligible Donors:** Woh donors jo 90 din pehle donate kar chuke hain – inko reminder bhejna ya appointment schedule karna.
- **Scheduled Appointments:** Aaj ke ya future ke appointments – “Mark Donation Done” se donation complete mark karna.
- **Hospital Requests:** Pending requests – approve karke fulfill karna. Agar insufficient inventory ho to partial fulfill bhi option hai.
- **Profile:** Blood bank ka naam, phone, address, aur **signature** (certificate pe dikhne wali) update karna.

### Why It Exists

Blood bank ko ek hi jagah se inventory, donors, requests, aur appointments manage karne hote hain. Ye dashboard sab operations ko centralize karta hai.

### How Users Interact

Blood bank login karte hi ye dashboard dikhai deta hai. “Record Donation” pe click karke donor search karte hain ya naya donor add karte hain, units enter karke submit karte hain. “Update Inventory” se blood type select karke units set karte hain. Hospital request pe “Approve” pe click karke fulfill karte hain. Profile me signature image upload karke certificate me apni custom signature use kar sakte hain.

---

## 1.6 Hospital Dashboard – Feature Explanation

### What It Does

Hospital dashboard pe hospital ko:

- **Available Blood Inventory:** Nearby blood banks ka blood stock – blood type wise, distance ke saath. List view ya grouped view me dekh sakte hain. Search, filter, sort options hain.
- **Create Blood Request:** Blood type, units, priority (critical/urgent/regular), notes ke saath request create karni hoti hai.
- **My Requests:** Jo requests hospital ne create ki hain – unka status (pending/approved/fulfilled) aur donor responses dekh sakte hain.
- **Events Tab:** Blood donation campaigns create/edit/delete kar sakte hain, registrations dekh sakte hain, Excel export kar sakte hain.
- **Profile:** Hospital ka naam, phone, address update – address se distance calculation me help milti hai.

### Why It Exists

Hospital ko blood ki demand create karni hai aur nearby supply dekhni hai. Request create karke donors respond karte hain, blood bank approve karti hai. Events se campaigns run karte hain.

### How Users Interact

Hospital login karte hi dashboard open hota hai. “Create Blood Request” pe click karke form bharte hain. Inventory tab me “Use my location” se distance based results dekh sakte hain. My Requests me refresh karke donor responses check karte hain. Events tab me campaigns create karte hain aur registrations export karte hain.

---

## 1.7 Certificate Generation – Feature Explanation

### What It Does

Jab donor ka koi donation **completed** hota hai, donation history table me us donation ke saamne “Certificate” button dikhai deta hai. Button pe click karne par ek naya browser window open hota hai jisme ek formatted certificate dikhai deta hai – donor ka naam, donation date, blood type, units, blood bank ka naam, aur “Authorized Signatory” section (blood bank ki signature ke saath). Browser ka Print dialog automatically open hota hai, jahan se user “Save as PDF” choose karke certificate ko PDF file ke roop me save kar sakta hai.

### Why It Exists

Donors ko donation complete hone par appreciation certificate chahiye hoti hai. Ye unke record ke liye useful hoti hai aur motivation bhi deti hai. Certificate ko official look dene ke liye blood bank ki signature use hoti hai.

### How Users Interact

Donor Donor Dashboard > Overview > Donation History me jata hai. Completed donation ke row me “Certificate” button pe click karta hai. Naya window open hota hai, certificate dikhai deta hai, Print dialog aata hai. User “Save as PDF” select karke file save karta hai. Certificate server pe store nahi hoti – client-side (user ke browser) pe generate hoti hai aur user khud save karta hai.

---

## 1.8 Distance Calculation – Feature Explanation

### What It Does

Jab donor ya hospital “Use my location” pe click karta hai, browser user ki current GPS location (latitude, longitude) leta hai. Is location se nearby blood banks/hospitals ki distance calculate hoti hai – **Haversine formula** use karke (Earth ko sphere maan kar do points ke beech exact distance km me). Result sort hota hai – sabse paas wala pehle.

Agar user ne location allow nahi kiya ya address se kaam chal raha hai, to **address-based distance** use hoti hai – pincode, city, state match karke approximate distance (0.5 km, 1 km, 5 km, 50 km, 200 km) assign hoti hai.

### Why It Exists

Donor aur hospital dono ko nearest facilities dekhni hoti hain. Distance se pata chal jata hai kaun si blood bank ya hospital sabse paas hai. GPS accurate hota hai; address fallback hai jab GPS na mile.

### How Users Interact

Donor/Hospital “Nearby” ya “Inventory” tab me “Use my location” pe click karta hai. Browser permission maangta hai – allow karne par location milti hai aur distance-based sorted list dikhai deti hai. Deny karne par message aata hai ki address profile me add karein.

---

## 1.9 Inventory Management – Feature Explanation

### What It Does

Blood bank apna inventory manage karti hai – har blood type (A+, A-, B+, B-, AB+, AB-, O+, O-) ke liye units set/update kar sakti hai. “Update Inventory” se blood type select karke total units enter karte hain. Ye total set hota hai (add nahi) – matlab agar pehle 10 tha aur 5 enter kiya to ab 5 ho jayega.

Hospital ko nearby blood banks ka **combined** inventory dikhai deta hai – matlab sab blood banks ka stock ek table me, blood type wise, distance ke saath.

### Why It Exists

Blood bank ko stock track karna zaroori hai. Hospital ko pata hona chahiye kis blood bank me kitna blood available hai taaki request sahi jagah bheji ja sake.

### How Users Interact

Blood bank dashboard me “Update Inventory” pe click karke form khulta hai – blood type select, units enter, submit. Hospital inventory tab me list/grouped view me sab dikh jata hai.

---

## 1.10 Blood Donation Campaigns (Events) – Feature Explanation

### What It Does

Hospitals blood donation campaigns (events) create karti hain – title, description, date, time, location, contact info, requirements, aur optional image ke saath. Donors Events tab me ye campaigns dekh kar register kar sakte hain. Hospital apne events ki list dekh sakti hai, edit/delete kar sakti hai, aur registered donors ki list Excel me export kar sakti hai.

### Why It Exists

Campaigns se organized blood donation drives hoti hain. Donors ek jagah pe aake donate karte hain. Hospital registrations track karti hai aur Excel me data le kar planning kar sakti hai.

### How Users Interact

Hospital Events tab me “Create Campaign” pe click karke form bharti hai, image upload karti hai. Donor Events tab me campaign card pe “Register” pe click karke apna naam, email, phone, blood type daalta hai. Hospital “View Registrations” se list dekh sakti hai aur “Export to Excel” se file download kar sakti hai.

---

## 1.11 Multilingual Support – Feature Explanation

### What It Does

Website pe language switcher hai – English, Hindi (हिंदी), Marathi (मराठी), aur Telugu (తెలుగు). User language change karte hi poora UI (buttons, labels, messages) us language me translate ho jata hai. Selection browser ke local storage me save hoti hai taaki next visit pe bhi wahi language rahe.

### Why It Exists

India me different regions me different languages bolte hain. Hinglish/multilingual support se zyada users comfortable feel karte hain aur project ko inclusive banata hai.

### How Users Interact

Header me globe icon (🌐) pe hover karke dropdown khulta hai. User apni language select karta hai – turant UI translate ho jata hai.

---

## 1.12 Custom Cursor – Feature Explanation

### What It Does

Desktop pe default mouse cursor hide ho jata hai aur ek soft red glow circle mouse ke peeche smooth animation ke saath follow karta hai. Mobile/touch devices pe ye feature **disable** rehta hai – kyunki touch me cursor ka sense nahi hota.

### Why It Exists

Ye purely visual/UX enhancement hai – project ko modern aur polished feel dene ke liye. Brand color (red) se consistent hai.

### How Users Interact

Koi extra interaction nahi – cursor automatically mouse follow karta hai. Mobile pe default cursor hi dikhai deta hai.

---

# PART 2: USER FLOW (SCREEN-BY-SCREEN)

---

## 2.1 First Visit – Home Page

**User kya karta hai:** Website ka URL open karta hai (e.g. `http://localhost:3000`).

**User kya dekhta hai:** Ek home page jisme:
- Top pe navigation bar – LifeLink logo, Language switcher, Login aur Register buttons.
- Hero section – bada headline “Save Lives Through Blood Donation”, subtitle, aur “Get Started” button.
- Sliding image carousel – blood donation related images auto-slide hoti hain (har 4.5 second pe).
- Teen feature cards – Donor, Hospital, Blood Bank ke liye – har ek pe “Get started” link.
- Stats section – 1000+ Donors, 50+ Hospitals, 20+ Blood Banks, 5000+ Lives Saved.
- Footer – copyright.

**System kya karta hai:** Home page static content dikhata hai. Koi login check nahi – koi bhi dekh sakta hai.

---

## 2.2 Register Flow

**User kya karta hai:** “Register” button pe click karta hai.

**User kya dekhta hai:** Registration form – Name, Email, Password, Phone, Role (Donor/Hospital/Blood Bank), aur role ke hisaab se extra fields. Donor ke liye Blood Type, Blood Bank ke liye optional Signature upload. Detailed address fields – Street, Area, City, State, Pincode (distance calculation ke liye zaroori).

**User kya karta hai:** Form bharta hai aur “Create Account” pe click karta hai.

**System kya karta hai:**
1. Form data backend API ko bhejta hai (`/api/auth/register`).
2. Backend user create karta hai (password encrypt karke), database me save karta hai.
3. Response me user data (id, name, email, role, etc.) aata hai.
4. Frontend ye data browser ke **local storage** me save karta hai (temporary session ke liye).
5. Role ke hisaab se redirect: Donor → `/donor`, Hospital → `/hospital`, Blood Bank → `/bloodbank`.

**User kya dekhta hai:** Turant uske dashboard pe redirect ho jata hai – welcome message ke saath.

---

## 2.3 Login Flow

**User kya karta hai:** “Login” button pe click karta hai, email aur password daalta hai, “Login” submit karta hai.

**System kya karta hai:**
1. Email-password backend ko bhejta hai (`/api/auth/login`).
2. Backend credentials verify karta hai – database me user dhundta hai, password match check karta hai.
3. Agar sahi – user data wapas bhejta hai.
4. Frontend user data local storage me save karta hai.
5. Role ke hisaab se redirect – Donor/Hospital/Blood Bank dashboard.

**User kya dekhta hai:** Dashboard – role ke hisaab se alag content.

---

## 2.4 Donor Dashboard Flow

**User kya dekhta hai (pehli baar):**
- Header: “Welcome, [Name]!”, Language switcher, Update Profile, Logout.
- Tabs: Overview | Nearby | Events.
- Overview tab by default open – stats cards (Total Donations, Blood Type, Lives Saved), eligibility banner (green = eligible, yellow = X days remaining), emergency requests list, donation history table.

**User “Respond” pe click karta hai (emergency request pe):** Modal khulta hai – Available Date, Available Time, Message (optional). User bharke Submit karta hai. System donor response backend ko bhejta hai. Success message aata hai, list refresh hoti hai.

**User “Certificate” pe click karta hai (completed donation pe):** Naya window open hota hai – certificate dikhai deta hai, Print dialog aata hai. User Save as PDF karta hai.

**User “Nearby” tab pe jata hai:** “Use my location” pe click – browser permission maangta hai. Allow pe coords mile, API call hogi, nearby blood banks aur hospitals distance ke saath table me dikhenge. Deny pe error message.

**User “Events” tab pe jata hai:** Campaigns list – Register pe click karke form, submit – registration complete.

---

## 2.5 Blood Bank Dashboard Flow

**User kya dekhta hai:**
- Stats: Total Inventory, Eligible Donors, Scheduled Appointments, Hospital Requests.
- Record Donation section – Add Record button.
- Inventory table – blood type wise units, Update Inventory form.
- Eligible Donors list – Remind, Schedule buttons.
- Scheduled Appointments – aaj ke appointments me “Mark Donation Done”.
- Hospital Requests – Approve button.

**User “Record Donation” pe click karta hai:** Form khulta hai. Donor search box me type karta hai (2+ chars) – existing donors list aati hai. Select kare ya naya donor add kare (name, email, phone, blood type, password for new). Units, notes daal ke Submit. Backend donation create karta hai, inventory update karta hai.

**User Hospital Request pe “Approve” pe click karta hai:** Confirmation modal – “Approve this request?” Confirm pe backend process karta hai. Agar inventory kam hai to “Partial fulfill?” option aata hai.

---

## 2.6 Hospital Dashboard Flow

**User kya dekhta hai:**
- Tabs: Inventory | My Requests | Events.
- Inventory tab – nearby blood banks ka stock, “Use my location”, filters (blood type, location search, sort).
- Create Blood Request button – form: blood type, units, priority, notes.
- My Requests – table me requests, status, donor responses expandable.

**User “Create Blood Request” pe click karta hai:** Form bharke Submit. Backend request create karta hai, donors ko emergency list me dikhai deti hai.

**User Events tab pe jata hai:** Campaigns create/edit/delete, registrations dekhna, Excel export.

---

# PART 3: CODE EXPLANATION (FILE-BY-FILE)

---

## 3.1 Technical Background (Simple Explanation)

**Frontend** matlab woh part jo user ke browser me chal raha hai – buttons, forms, tables jo user dekh raha hai. Ye **React** use karta hai – ek JavaScript library jo UI components banane me help karti hai. Files ka extension `.jsx` hota hai (JavaScript + HTML-like syntax).

**Backend** matlab woh server jo database se baat karta hai, data process karta hai, aur frontend ko API responses bhejta hai. Ye **Node.js** pe **Express** use karta hai. Files `.js` (JavaScript) hoti hain.

**Database** – **MongoDB** – data store karta hai (users, donations, requests, etc.) in collections.

**API** – Application Programming Interface – matlab frontend backend se HTTP requests bhejta hai (e.g. “give me donor history”) aur backend JSON response bhejta hai.

---

## 3.2 Frontend – Main Entry & App Structure

### File: `frontend/src/index.js`

**Purpose:** Ye file application ka **entry point** hai. Jab website load hoti hai, pehle ye file run hoti hai. Ye React app ko browser ke DOM (page structure) me “mount” karta hai – matlab React ko batata hai ki “App component ko `root` id wale element me render karo.”

**Connection:** Ye file `App.jsx` ko import karti hai aur `index.css` (global styles) ko load karti hai.

**Language:** Ye file **JavaScript** me likhi hai. `import` aur `ReactDOM.render` JavaScript syntax hain.

---

### File: `frontend/src/App.jsx`

**Purpose:** Ye file **routing** handle karti hai – matlab URL change hone par kaunsa screen dikhana hai. `/` = Home, `/login` = Login, `/register` = Register, `/donor` = Donor Dashboard, `/hospital` = Hospital Dashboard, `/bloodbank` = Blood Bank Dashboard. Agar koi unknown URL ho to Home pe bhej deti hai.

**Important logic:** Ye file `CursorFollower` component ko bhi render karti hai – matlab custom cursor har page pe dikhai degi. Ek `useEffect` hai jo check karta hai – agar device touch-enabled hai (mobile/tablet) to `custom-cursor-active` class body pe nahi lagati; warna lagati hai. Is class se default cursor hide ho jata hai (CSS me `cursor: none`). **Why this approach?** Mobile pe custom cursor useful nahi – touch me mouse nahi hota. Isliye sirf desktop pe enable kiya hai.

**Language:** Ye file **React (JSX)** me hai. `Routes`, `Route`, `element` – ye React Router ke parts hain. JSX me HTML jaisa syntax JavaScript ke andar use hota hai.

---

## 3.3 Authentication Files

### File: `frontend/src/utils/auth.js`

**Purpose:** Ye file **user session** ko manage karti hai. Login/Register ke baad user data browser ke **local storage** me save hota hai – taaki page refresh hone par bhi user logged-in rahe. `setUser(user)` – user object ko JSON string bana kar `localStorage.setItem('user', ...)` se save karta hai. `getUser()` – `localStorage.getItem('user')` se data nikaal kar parse karke return karta hai. `clearUser()` – logout pe `token` aur `user` dono remove karta hai.

**Why local storage?** Kyunki ye ek simple approach hai – server pe session maintain karne ki zaroorat nahi. Alternative: Server-side sessions (cookies) – lekin is project me frontend-heavy auth use kiya hai, development simplicity ke liye.

**Language:** Pure **JavaScript**.

---

### File: `frontend/src/components/Auth/Login.jsx`

**Purpose:** Login form – email, password fields, submit button. User submit karta hai to `handleSubmit` function run hota hai. Ye function `axios.post` se backend ko credentials bhejta hai. Agar success – `response.data.user` milta hai, `setUser(userData)` se save hota hai, phir `navigate` se role ke hisaab se redirect (donor → `/donor`, etc.).

**Logic justification:** Demo accounts bhi dikhaye gaye hain (rahul@donor.com, general@hospital.com, central@bloodbank.com – password: password123) – evaluator/testing ke liye turant login test karne ke liye.

**Language:** **React (JSX)** – form, buttons, `useState`, `useNavigate` – sab React hooks aur JSX.

---

### File: `frontend/src/components/Auth/Register.jsx`

**Purpose:** Registration form – name, email, password, phone, role, blood type (donor), address (street, area, city, state, pincode), aur blood bank ke liye optional signature upload. `handleChange` se form fields update hote hain. Role change hone par conditional fields show/hide – donor pe blood type, blood bank pe signature. Signature upload me `FileReader.readAsDataURL` use hota hai – ye image file ko base64 string me convert karta hai taaki backend me bina separate file upload ke bhej sake.

**Why detailed address?** Distance calculation ke liye pincode zaroori hai. Backend aur frontend dono pincode/city/state match karke approximate distance nikalte hain jab GPS na ho.

**Language:** **React (JSX)** + **JavaScript**.

---

## 3.4 Certificate Generation

### File: `frontend/src/utils/certificate.js`

**Purpose:** Ye file **donation certificate** generate karti hai. Do functions hain: `generateCertificate(donation, user)` aur `downloadCertificate(donation, user)`. `downloadCertificate` sirf `generateCertificate` ko call karta hai – dono same kaam karte hain.

**How it works (step by step):**
1. `donation` object se blood bank name, donation date, blood type, units nikalte hain.
2. Blood bank ke `signature` field me agar image (base64) hai to use karte hain; warna default `/after.png` use hota hai.
3. Ek pura HTML document string banate hain – `<!DOCTYPE html>`, `<head>`, `<style>`, `<body>` – certificate design ke saath. Donor name, date, blood type, units, blood bank name – sab template me inject hota hai.
4. `window.open('', '_blank', 'width=800,height=600')` – ye **JavaScript** ka browser API hai – naya window/tab open karta hai.
5. `certificateWindow.document.write(certificateHTML)` – us naye window me HTML inject karte hain.
6. Signature image load hone ka wait karte hain (agar hai to), phir `certificateWindow.print()` – ye browser ka Print dialog open karta hai. User “Save as PDF” choose karke file save karta hai.

**Why client-side, not server-side PDF?** Server pe PDF library (e.g. Puppeteer, pdfkit) use karna complex hota aur server load badhta. Client-side me browser ka built-in print-to-PDF free hai aur fast. Trade-off: Server pe certificate store nahi hoti – user khud save karta hai. Ye acceptable hai kyunki certificate ek-time download hai.

**Language:** **JavaScript**. `window`, `document`, `toLocaleDateString` – sab browser JavaScript APIs.

---

## 3.5 Donor Dashboard – Deep Logic

### File: `frontend/src/components/Donor/DonorDashboard.jsx`

**Purpose:** Donor ka main dashboard – Overview, Nearby, Events tabs, emergency requests, donation history, certificate, profile update.

**Key logic – Eligibility days:**
- `loadDashboardData` me donation history aati hai.
- Completed donations aur scheduled donations alag filter hote hain.
- Agar koi **scheduled** donation hai (abhi aane wali) to `daysUntilScheduled` = next donation date – today. Ye dikhaya jata hai – “Donation scheduled in X days.”
- Agar last **completed** donation hai to `daysSinceDonation` = today – last donation date. `daysUntilEligible` = 90 – daysSinceDonation. **Why 90 days?** WHO aur medical guidelines ke hisaab se do donations ke beech minimum 90 din gap hona chahiye donor health ke liye. Ye logic frontend me calculate hota hai – backend se history aati hai, frontend days nikalta hai.
- Agar kabhi donate nahi kiya to `eligibilityDays = 0` – eligible.

**Key logic – Nearby facilities:**
- `loadNearbyFacilities(coords)` – `coords` optional. Agar `coords` (lat, lng) diye to API ko params me bhejte hain; backend Haversine se distance calculate karta hai. Agar nahi to backend user ke profile address (pincode) se approximate distance use karta hai.
- `handleUseMyLocation` – `navigator.geolocation.getCurrentPosition` – ye browser API user se location permission maangta hai. Milne par coords `loadNearbyFacilities` ko pass hote hain.

**Auto-refresh:** `setInterval(loadDashboardData, 60000)` – har 60 second pe data refresh. Kyunki emergency requests real-time change ho sakti hain, isliye periodic refresh.

**Language:** **React (JSX)** + **JavaScript**. `useState`, `useEffect`, `useNavigate`, `useTranslation` – React hooks.

---

## 3.6 Blood Bank Dashboard – Key Logic

### File: `frontend/src/components/BloodBank/BloodBankDashboard.jsx`

**Purpose:** Inventory, record donation, eligible donors, appointments, hospital requests, profile.

**Record Donation flow:**
- Donor search: `handleSearchDonors(query)` – 2+ characters pe `bloodBankAPI.searchDonors(query)` call. Backend `User.find` with regex on name, email, phone – donors return karta hai. Frontend dropdown me dikhata hai.
- Agar existing donor select kiya – `donorId` backend ko bhejta hai, password nahi. Agar naya donor – name, email, phone, bloodType, password (required) bhejta hai. Backend naya User create karta hai, phir Donation create karta hai.
- Donation create hone par inventory bhi backend me update hoti hai.

**Process Request (Hospital Request Approve):**
- `showApproveConfirm` – pehle confirmation modal dikhata hai. User Confirm pe `executeApprove` – backend `processRequest` call. Agar insufficient inventory – backend error bhejta hai. Frontend check karta hai – agar partial units possible hain to “Partial fulfill with X units?” confirm karta hai. User confirm kare to `executeApprove` partial units ke saath dubara call.

**Language:** **React (JSX)** + **JavaScript**.

---

## 3.7 Hospital Dashboard – Distance & Inventory

### File: `frontend/src/components/Hospital/HospitalDashboard.jsx`

**Purpose:** Inventory view, create request, my requests, events.

**Inventory source:** Hospital dashboard **donor API** (`getNearbyBloodBanks`) use karta hai – kyunki ye API sab blood banks ka combined inventory + distance return karta hai. Hospital-specific inventory API alag nahi – donor wala API generic “nearby blood banks with inventory” hai. Isliye reuse kiya – **code reuse** aur consistency.

**Distance calculation:** Backend lat/lng se Haversine use karta hai. Agar hospital ne “Use my location” kiya to coords bhejte hain. Agar nahi to backend hospital profile se address/lat-lng use karta hai. Frontend me `calculateAddressDistance` (from `utils/location.js`) fallback hai – jab backend distance na bheje to pincode/city match karke approximate distance.

**My Requests refresh:** `setInterval(fetchMyRequests, 5000)` – har 5 second. Kyunki donor responses real-time aate hain, hospital ko jaldi dikhna chahiye. **Why 5 seconds?** Balance between real-time feel aur server load. Real WebSockets use karte to instant hota – lekin complexity badh jati, isliye polling choose kiya.

**Language:** **React (JSX)** + **JavaScript**.

---

## 3.8 Distance Calculation – Backend & Frontend

### File: `backend/utils/haversine.js`

**Purpose:** **Haversine formula** – do geographic points (latitude, longitude) ke beech distance km me. Earth ko sphere maan kar formula: `R = 6371` km (Earth radius), angles se radians, then `d = R * c` where `c` is angular distance. Ye mathematically accurate hota hai short-medium distances ke liye.

**Language:** **JavaScript** – pure math, no React.

---

### File: `backend/utils/pincodeDistance.js`

**Purpose:** Jab latitude-longitude na ho to **address matching** se approximate distance. Same pincode = 0.5 km, same street = 1 km, same area = 2 km, same city = 5–8 km, same state = 50 km, different state = 200 km. Ye exact nahi – rough estimate. **Why?** Geocoding API (Google etc.) use karte to accurate hota – lekin API key, cost, dependency. Simple address matching development me sufficient tha.

**Language:** **JavaScript**.

---

### File: `frontend/src/utils/location.js`

**Purpose:** Frontend me bhi `calculateDistance` (Haversine) aur `calculateAddressDistance` (address matching) – hospital dashboard me fallback ke liye use hota hai jab backend distance na bheje.

---

## 3.9 Multilingual (i18n)

### File: `frontend/src/i18n.js`

**Purpose:** `i18next` library – translations load karta hai. `resources` object me `en`, `hi`, `mr`, `te` – har language ke liye key-value pairs. Example: `"auth.login.title": "Login to LifeLink"` (en), `"auth.login.title": "लाइफलिंक में लॉगिन करें"` (hi). `LanguageDetector` – browser/localStorage se preferred language detect karta hai. `fallbackLng: 'en'` – agar koi key missing ho to English use hogi.

**Language:** **JavaScript** – configuration object.

---

### File: `frontend/src/components/LanguageSwitcher.jsx`

**Purpose:** Dropdown button – languages list, click pe `i18n.changeLanguage(lng)` call. Selected language pe checkmark. CSS me `group-hover` – hover pe dropdown visible.

**Language:** **React (JSX)**.

---

## 3.10 Custom Cursor

### File: `frontend/src/components/CursorFollower.jsx`

**Purpose:** Mouse position track – `mousemove` event se `targetRef` update. `requestAnimationFrame` se continuous loop – current position ko target ki taraf slowly move (lerp: `prev + (target - prev) * 0.12`). 0.12 = 12% step – isse smooth follow, jhatka nahi. Touch device check – `ontouchstart` in window – agar hai to component return null (render nahi). Do divs – outer glow (420px), inner dot (24px) – dono `position: fixed`, mouse coords pe.

**Language:** **React (JSX)** + **JavaScript**.

---

### File: `frontend/src/index.css`

**Purpose:** `.cursor-glow` – 420px circle, `radial-gradient` red transparent. `.cursor-glow-inner` – 24px dot. `body.custom-cursor-active { cursor: none }` – default cursor hide. Ye **CSS** hai – styling language, HTML elements ko look deti hai.

---

## 3.11 API Service

### File: `frontend/src/services/api.js`

**Purpose:** **Axios** instance – base URL `http://localhost:5000/api`. Request interceptor – har request pe `localStorage` se user nikaal kar `x-mock-user-id` aur `x-mock-user-role` headers me add. Backend in headers se user identify karta hai (simple auth – JWT optional). Response interceptor – 401 (unauthorized) pe token remove (logout scenario). `authAPI`, `donorAPI`, `hospitalAPI`, `bloodBankAPI` – sab endpoints grouped, har ek me functions (e.g. `donorAPI.getDashboard()` = GET /donor/dashboard).

**Why headers for user id?** Kyunki project me token-based auth optional hai – development simplicity ke liye frontend user id bhejta hai, backend trust karta hai. Production me proper JWT validation honi chahiye.

**Language:** **JavaScript** – axios, Promises.

---

# PART 4: DATABASE & SYNCHRONIZATION

---

## 4.1 Database – MongoDB

**What is MongoDB?** Ek **NoSQL** database – data ko “documents” (JSON-like) me store karta hai. Traditional tables (rows/columns) ki jagah “collections” hoti hain – har document flexible structure ho sakta hai.

**Connection:** `backend/config/db.js` – `mongoose.connect(process.env.MONGO_URI)`. `MONGO_URI` .env file me hai – e.g. `mongodb://localhost:27017/lifelink`. Server start hote hi connect ho jata hai.

---

## 4.2 Login & Registration Synchronization

**Flow:**
1. User Register form submit karta hai → Frontend `POST /api/auth/register` with form data.
2. Backend `authController.register` – User model se `User.create({...})` – MongoDB me naya document insert.
3. Backend response me `user` object bhejta hai (password exclude).
4. Frontend `setUser(userData)` – `localStorage.setItem('user', JSON.stringify(userData))`.
5. Redirect – `navigate('/donor')` etc. Dashboard load hote hi `getUser()` se localStorage se user mil jata hai – session persist.

**Login:** Same – backend verify, user return, frontend localStorage me save, redirect.

---

## 4.3 Dashboard Data Synchronization

**Donor Dashboard:**
- `loadDashboardData` – `donorAPI.getEmergencyRequests()`, `getDonationHistory()`, etc. – sab backend APIs.
- Backend `req.headers['x-mock-user-id']` se donor id leta hai – MongoDB me queries: `BloodRequest.find`, `Donation.find({ donor: donorId })`, etc.
- Response frontend ko JSON me aata hai – `setEmergencyRequests`, `setDonationHistory` se state update, UI re-render.

**Blood Bank / Hospital:** Same pattern – user id headers me, backend filter karke data return, frontend state update.

---

## 4.4 Certificate & Donation History Link

- Certificate **server pe store nahi hoti** – client-side generate.
- Donation history **MongoDB** me `Donation` collection me – `donor`, `bloodBank`, `donationDate`, `status: 'completed'`, etc.
- Donor dashboard `getDonationHistory` se ye list leta hai. Frontend me completed donations ke row me “Certificate” button – click pe `generateCertificate(donation, user)` – donation object me blood bank, date, units sab hai – certificate HTML me inject ho jata hai.
- **Sync:** Donation backend me create hoti hai (blood bank record karti hai) → Donor history refresh → Certificate button dikhai deta hai. Koi alag sync nahi – history hi source of truth.

---

## 4.5 Inventory Real-Time Update

- Blood bank “Update Inventory” → `PUT /api/bloodbank/inventory/:bloodType` → Backend `Inventory.findOneAndUpdate` – MongoDB me upsert. `loadDashboardData` refresh → naya inventory frontend me.
- “Record Donation” → Backend donation create karta hai + Inventory me us blood type ke units **add** karta hai (increment). Phir `loadDashboardData` se updated inventory.
- Hospital inventory view – donor API se nearby blood banks + unka inventory. Blood bank update kare to next hospital refresh (ya 60 sec auto) me updated dikhai dega.
- **Real-time:** Polling (periodic refresh) use hua hai – WebSockets nahi. Isliye “real-time” thoda delayed hai (seconds) – lekin sufficient hai.

---

# PART 5: FILE PURPOSE SUMMARY

---

| File Path | Purpose (1–2 lines) |
|-----------|---------------------|
| `frontend/src/index.js` | Application entry point – React app ko browser me mount karta hai. |
| `frontend/src/App.jsx` | Routing – URL ke hisaab se screens switch, CursorFollower render, cursor class body pe. |
| `frontend/src/index.css` | Global CSS – cursor glow, dashboard styles, animations, blob effect. |
| `frontend/src/i18n.js` | Multilingual – English, Hindi, Marathi, Telugu translations load aur configure. |
| `frontend/src/utils/auth.js` | User session – localStorage me user save/get/clear, login state manage. |
| `frontend/src/utils/certificate.js` | Certificate – HTML template generate, new window open, print trigger. |
| `frontend/src/utils/location.js` | Distance – Haversine, address-based distance, frontend fallback. |
| `frontend/src/utils/geolocation.js` | GPS – browser geolocation API, city name se coordinates (simple lookup). |
| `frontend/src/services/api.js` | API – axios instance, auth headers, donor/hospital/bloodbank API functions. |
| `frontend/src/services/eventAPI.js` | Events API – create, get, register, export Excel. |
| `frontend/src/components/Auth/Login.jsx` | Login form – email/password, backend verify, redirect by role. |
| `frontend/src/components/Auth/Register.jsx` | Register form – all fields, role-based extras, signature upload. |
| `frontend/src/components/Donor/DonorDashboard.jsx` | Donor dashboard – Overview, Nearby, Events, eligibility, requests, history, certificate. |
| `frontend/src/components/BloodBank/BloodBankDashboard.jsx` | Blood bank dashboard – inventory, record donation, appointments, requests, profile. |
| `frontend/src/components/Hospital/HospitalDashboard.jsx` | Hospital dashboard – inventory, create request, my requests, events. |
| `frontend/src/components/Hospital/EventManagement.jsx` | Events – create/edit/delete campaigns, registrations, Excel export. |
| `frontend/src/components/Events/EventsList.jsx` | Donor events – campaigns list, register form. |
| `frontend/src/components/Home.jsx` | Home page – hero, slider, feature cards, stats. |
| `frontend/src/components/ImageSlider.jsx` | Image carousel – auto-slide, dots, blood donation images. |
| `frontend/src/components/LanguageSwitcher.jsx` | Language dropdown – 4 languages, i18n change. |
| `frontend/src/components/CursorFollower.jsx` | Custom cursor – mouse follow, glow effect, touch disable. |
| `frontend/src/components/NotificationModal.jsx` | Modal – confirm/success/error messages, blood bank approvals. |
| `frontend/tailwind.config.js` | Tailwind – colors, shadows, animations configure. |
| `backend/server.js` | Express server – routes, middleware, MongoDB connect, CORS, body parser. |
| `backend/config/db.js` | MongoDB connection – mongoose connect. |
| `backend/controllers/authController.js` | Auth – login, register, profile update, password change. |
| `backend/controllers/donorController.js` | Donor – dashboard, emergency requests, respond, history, nearby, notifications. |
| `backend/controllers/bloodbankController.js` | Blood bank – inventory, record donation, search donors, appointments, process requests. |
| `backend/controllers/hospitalController.js` | Hospital – dashboard, create request, get requests, inventory. |
| `backend/controllers/eventController.js` | Events – create, get, register, registrations, Excel export. |
| `backend/models/User.js` | User schema – name, email, password, role, bloodType, address, signature. |
| `backend/models/Donation.js` | Donation schema – donor, bloodBank, date, bloodType, units, status. |
| `backend/models/BloodRequest.js` | Blood request schema – hospital, bloodType, units, priority, status. |
| `backend/models/DonorResponse.js` | Donor response – request, donor, availableDate, availableTime. |
| `backend/models/Inventory.js` | Inventory – bloodBank, bloodType, units. |
| `backend/models/Event.js` | Event schema – title, date, location, image, createdBy. |
| `backend/models/EventRegistration.js` | Event registration – event, name, email, phone, bloodType. |
| `backend/models/Notification.js` | Notification – donor, bloodBank, message, isRead. |
| `backend/utils/haversine.js` | Haversine – lat/lng se distance km. |
| `backend/utils/pincodeDistance.js` | Address distance – pincode/city/state matching. |
| `backend/utils/distance.js` | Distance sort – coordinates se sort. |

---

# PART 6: PROGRAMMING LANGUAGE IDENTIFICATION

---

For evaluators who ask “Ye line kis language me hai?”:

- **JavaScript:** `.js` files – logic, functions, API calls, data handling. Example: `const user = getUser();`, `axios.post(...)`, `localStorage.setItem(...)`.
- **React / JSX:** `.jsx` files – UI components, `return ( <div>...</div> )`, `useState`, `useEffect`, `useNavigate`. JSX = JavaScript + HTML-like syntax inside JavaScript.
- **CSS:** `index.css`, `tailwind.config.js` (theme part) – styling: colors, margins, animations. Example: `cursor: none;`, `border-radius: 50%;`.
- **HTML:** Direct HTML sirf certificate template me string ke andar – `certificate.js` me template literal. Normal React me HTML nahi, JSX use hota hai jo compile hone par HTML ban jata hai.

---

# PART 7: LOGIC JUSTIFICATION & ALTERNATIVES

---

## 7.1 Why Client-Side Certificate Instead of Server PDF?

**Chosen:** Client-side HTML + browser print.  
**Alternative:** Server-side PDF (Puppeteer, pdfkit) – backend PDF generate karke download link de.  
**Why not:** Server load, complexity, dependencies. Client-side free aur simple.  
**Trade-off:** Certificate server pe store nahi – user save karta hai. Acceptable for this use case.

---

## 7.2 Why 90 Days for Eligibility?

**Chosen:** 90 days between donations.  
**Reason:** WHO aur medical guidelines – red blood cells recover hone me ~8–12 weeks. 90 days safe standard.  
**Alternative:** 56 days (some countries) – lekin India me 90 days common guideline.

---

## 7.3 Why Polling Instead of WebSockets for Real-Time?

**Chosen:** `setInterval` se har 5–60 sec refresh.  
**Alternative:** WebSockets – instant push.  
**Why not:** WebSockets me backend complexity (socket server, connections). Polling simple, existing REST API reuse. Trade-off: Thoda delay – acceptable for blood requests.

---

## 7.4 Why Headers (x-mock-user-id) Instead of JWT?

**Chosen:** Frontend user id header me bhejta hai, backend trust karta hai.  
**Reason:** Development speed, simple flow.  
**Production:** JWT use karna chahiye – token verify, tamper-proof. Ye project development/demo focus tha.

---

## 7.5 Why Address-Based Distance (Not Full Geocoding API)?

**Chosen:** Pincode, city, state match – approximate km.  
**Alternative:** Google Maps Geocoding API – address → lat/lng, phir Haversine.  
**Why not:** API key, cost, rate limits. Simple matching sufficient for relative “nearby” sort.

---

# END OF DOCUMENTATION

---

*This documentation proves that the team understands every part of the project – what it does, why it exists, how it works, and why certain approaches were chosen. It is sufficient for external evaluators, non-technical reviewers, and strict project defense questioning.*
