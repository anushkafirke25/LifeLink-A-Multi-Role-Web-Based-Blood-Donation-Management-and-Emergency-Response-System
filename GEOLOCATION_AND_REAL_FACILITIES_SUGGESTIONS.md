# Real Hospitals/Blood Banks & Geolocation – Suggestions

This document outlines how to move from **pincode-based distance** and **seed/fake data** to **real-life hospitals & blood banks** with **GPS geolocation** for finding the nearest facilities.

---

## Corrections applied (recent)

- **Lives saved:** Equals the **number of completed donations** for that donor (no ×3). Shown in Donor Dashboard from `donationHistory.filter(d => d.status === 'completed').length`; backend also sends `livesSaved: totalDonations`.
- **Translations:** Donor dashboard (Priority, N/A, Unknown, Blood Type/Units in modals, alerts, placeholders), Hospital dashboard (filter labels: Search, Filter Blood Type, Min Units, Sort By, Clear All, “No results match your filters”, Distance column, priority dropdown options), and Events (Select Blood Type, Notes Optional, placeholder) are now wired to i18n in English, Hindi, and Marathi.

---

## 1. Current Logic (Summary)

- **Backend:** `backend/utils/pincodeDistance.js` – distance is estimated from pincode/address matching (same pincode → 0.5 km, same city → 5–8 km, etc.). No real coordinates.
- **Data:** Hospitals and blood banks come from the `User` collection (role `hospital` / `bloodbank`), usually seeded – not from a real-world dataset.
- **Donor location:** Taken from profile `address` (pincode, city, state, etc.) – no GPS.

---

## 2. Use Real-Life Hospitals & Blood Banks

### Option A: Government / Open Datasets (India)

- **National Health Mission (NHM) / State health departments** – sometimes provide lists of blood banks and hospitals.
- **Data.gov.in** – search for “blood bank”, “hospital”, “health facility” for CSV/API.
- **OpenStreetMap (OSM)** – Overpass API can return hospitals and blood banks with name, address, and lat/lon.

Example OSM Overpass query (hospitals in a bounding box):

```text
[out:json];
node["amenity"="hospital"]({{bbox}});
out body;
```

Similar query with `["healthcare"="blood_donation"]` or `["amenity"="blood_bank"]` for blood banks.

### Option B: Google Places API (paid, accurate)

- **Places API** – “hospital”, “blood bank” near a location.
- Returns name, address, place_id, and **location (lat/lng)**.
- Needs API key and billing; good for production if budget allows.

### Option C: Hybrid

- **Seed your DB** once from OSM or Data.gov.in (name, address, lat, lng).
- **Optional:** Periodically refresh or enrich with Google Places.
- Your app then uses **lat/lng** for distance and “nearest” logic.

---

## 3. Add Real Geolocation (Find Nearest)

### 3.1 Store Latitude & Longitude

- **User (donor):** Add optional `location: { type: 'Point', coordinates: [lng, lat] }` (GeoJSON) in addition to `address`.
- **Hospitals / Blood banks:** Add same `location` field (from OSM/Places/CSV).
- Use a **2dsphere index** in MongoDB for geo queries.

Example (Mongoose):

```js
const schema = new Schema({
  name: String,
  address: { ... },
  location: {
    type: { type: String, default: 'Point' },
    coordinates: { type: [Number], default: undefined }  // [longitude, latitude]
  }
});
schema.index({ location: '2dsphere' });
```

### 3.2 Get User’s Location

**Option 1 – Browser Geolocation (recommended for “current location”)**

- In the donor dashboard “Nearby” tab, call `navigator.geolocation.getCurrentPosition()`.
- Send lat/lng to the backend (e.g. `GET /api/donor/nearby-blood-banks?lat=19.07&lng=72.87`).
- Backend uses these coordinates for distance/sort.

**Option 2 – Keep address/pincode as fallback**

- If user denies GPS or is on desktop without location, fall back to current **pincode/address** and keep using your existing `pincodeDistance` (or geocode address once to get lat/lng).

### 3.3 Backend: Nearest Facilities by Distance

- **MongoDB:** Use `$geoNear` or `$near` with a `2dsphere` index to get sorted-by-distance list.
- **Haversine in app:** If you don’t use 2dsphere, you can compute distance in app from lat/lng (Haversine formula) and sort. Slower for large datasets.

Example `$geoNear` (aggregation):

```js
const [result] = await User.aggregate([
  {
    $geoNear: {
      near: { type: 'Point', coordinates: [lng, lat] },
      distanceField: 'distance',
      maxDistance: 50000,  // metres
      spherical: true,
      query: { role: 'bloodbank' }
    }
  },
  { $limit: 20 }
]);
```

Return `result` with `distance` in km (convert from metres if needed).

---

## 4. Implementation Checklist

| Step | Task |
|------|------|
| 1 | Add `location: { type, coordinates }` (GeoJSON) to User (and any hospital/blood-bank model). |
| 2 | Create 2dsphere index on `location`. |
| 3 | (Optional) Script to import real hospitals/blood banks from OSM or CSV and set `location`. |
| 4 | Donor dashboard: “Use my location” button → `navigator.geolocation.getCurrentPosition` → send lat/lng to API. |
| 5 | New or updated API: e.g. `GET /api/donor/nearby-blood-banks?lat=19.07&lng=72.87` using `$geoNear` (or Haversine). |
| 6 | Keep existing pincode/address-based API as fallback when no lat/lng. |
| 7 | Frontend: show “Nearest first” using `distance` from API; optionally show map (e.g. Leaflet/Google Maps). |

---

## 5. Privacy & UX

- Ask for location only when the user opens “Nearby” (or taps “Find nearest”).
- Show a short message: “We use your location only to show nearest blood banks/hospitals.”
- If permission denied, fall back to address/pincode and show a note: “Add address or enable location for accurate distance.”

---

## 6. Summary

- **Lives saved:** Already corrected to equal **number of completed donations** (no “×3”).
- **Translations:** Donor dashboard labels (filters, nearby, hospital names section labels, etc.) are wired to i18n so they respect the selected language.
- **Real facilities:** Use OSM/Data.gov.in/Google to get real hospitals and blood banks with **lat/lng**, store in DB with GeoJSON.
- **Geolocation:** Use browser geolocation for “current position”, backend uses **$geoNear** (or Haversine) to return “nearest” facilities; keep pincode/address as fallback.

---

## 7. Implemented in this project

- **Real-time location:** Donor dashboard → **Nearby** tab → **"Use my location"** button. Browser asks for permission; lat/lng are sent to the API. Backend uses **Haversine** distance when `?lat=&lng=` are provided. Seed data has **latitude/longitude** for facilities so distance is in km.
- **Fallback:** If the user does not use "Use my location", the app still uses **profile address (pincode)** for distance when available.
- **Real facilities from OSM:** Script `fetchRealFacilitiesFromOSM.js` fetches hospitals and **blood banks** from Overpass (tags: `healthcare=blood_bank`, `healthcare=blood_donation`, `amenity=blood_bank`, plus **name search** "blood bank"). Run: `npm run fetch-real-facilities`. Use `BBOX=18.4,73.7,18.6,73.9` for Pune; `BBOX=8,68,35,97` for India.
- **Real distance:** Use **"Use my location"** in the Donor Nearby tab so the backend gets your GPS and uses **Haversine** (km). For facilities that have address but no lat/lng (e.g. hypothetical seed data), run **`npm run geocode-facilities`** – it uses Nominatim (OSM) to fill latitude/longitude from address so distance becomes real. Run once after seeding or after importing from Data.gov.in.
- **Real blood banks (India):** If OSM returns few blood banks, use **Data.gov.in Blood Bank Directory** (CSV) – import names/addresses, then run `npm run geocode-facilities` to get coordinates.
- **User model:** Optional GeoJSON `geo` and `latitude`/`longitude` for facilities; 2dsphere index (sparse) on `geo` if needed.

---

If you tell me your stack (e.g. “we only want OSM + browser geolocation, no Google”), I can outline exact API changes and sample requests/responses next.
