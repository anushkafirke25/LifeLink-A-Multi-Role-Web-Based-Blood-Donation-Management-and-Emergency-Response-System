/**
 * Fetch real blood banks and hospitals from OpenStreetMap (Overpass API)
 * and optionally seed/update your DB with name, address, lat, lng.
 *
 * Run: node scripts/fetchRealFacilitiesFromOSM.js
 *
 * Set DRY_RUN=1 to only print results without writing to DB.
 * Set BBOX="lat1,lng1,lat2,lng2" for a region (e.g. India: 8,68,35,97).
 */

const https = require('https');
const mongoose = require('mongoose');
require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/lifelink';
const DRY_RUN = process.env.DRY_RUN === '1';
// Bounding box: default Pune area (approx). For all India use: 8,68,35,97
const BBOX = process.env.BBOX || '18.4,73.7,18.6,73.9';

const OVERPASS_SERVERS = [
  'overpass-api.de',
  'overpass.kumi.systems'
];

function overpassQuery(bbox, tagKey, tagValue, serverIndex = 0) {
  const query = `[out:json][timeout:25];(node["${tagKey}"="${tagValue}"](${bbox});way["${tagKey}"="${tagValue}"](${bbox}););out body center;`;

  return new Promise((resolve, reject) => {
    const hostname = OVERPASS_SERVERS[serverIndex] || OVERPASS_SERVERS[0];
    const body = `data=${encodeURIComponent(query)}`;
    const req = https.request({
      hostname,
      path: '/api/interpreter',
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json',
        'Content-Length': Buffer.byteLength(body)
      }
    }, (res) => {
      let data = '';
      res.on('data', (ch) => { data += ch; });
      res.on('end', () => {
        if (res.statusCode !== 200) {
          return reject(new Error(`Overpass HTTP ${res.statusCode}: ${data.slice(0, 200)}`));
        }
        const first = data.trim().slice(0, 20);
        if (first.startsWith('<?xml') || first.startsWith('<')) {
          return reject(new Error(`Overpass returned XML instead of JSON. Try again or use another server. ${data.slice(0, 150)}`));
        }
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(new Error(`Invalid JSON from Overpass: ${data.slice(0, 150)}`));
        }
      });
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

async function overpassQueryWithRetry(bbox, tagKey, tagValue, serverIndex = 0) {
  let lastErr;
  for (let i = serverIndex; i < OVERPASS_SERVERS.length; i++) {
    try {
      return await overpassQuery(bbox, tagKey, tagValue, i);
    } catch (e) {
      lastErr = e;
      if (i < OVERPASS_SERVERS.length - 1) {
        console.log(`  (trying ${OVERPASS_SERVERS[i + 1]}...)`);
      }
    }
  }
  throw lastErr;
}

// Query by name regex (e.g. "blood bank") - returns nodes/ways with name matching
function overpassQueryByName(bbox, nameRegex, serverIndex = 0) {
  const regex = nameRegex.replace(/"/g, '\\"');
  const query = `[out:json][timeout:25];(node["name"~"${regex}",i](${bbox});way["name"~"${regex}",i](${bbox}););out body center;`;
  return new Promise((resolve, reject) => {
    const hostname = OVERPASS_SERVERS[serverIndex] || OVERPASS_SERVERS[0];
    const body = `data=${encodeURIComponent(query)}`;
    const req = https.request({
      hostname,
      path: '/api/interpreter',
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json',
        'Content-Length': Buffer.byteLength(body)
      }
    }, (res) => {
      let data = '';
      res.on('data', (ch) => { data += ch; });
      res.on('end', () => {
        if (res.statusCode !== 200) return reject(new Error(`Overpass HTTP ${res.statusCode}`));
        const first = data.trim().slice(0, 20);
        if (first.startsWith('<?xml') || first.startsWith('<')) return reject(new Error('Overpass returned XML'));
        try { resolve(JSON.parse(data)); } catch (e) { reject(e); }
      });
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

async function overpassQueryByNameWithRetry(bbox, nameRegex) {
  let lastErr;
  for (let i = 0; i < OVERPASS_SERVERS.length; i++) {
    try {
      return await overpassQueryByName(bbox, nameRegex, i);
    } catch (e) {
      lastErr = e;
      if (i < OVERPASS_SERVERS.length - 1) console.log(`  (trying ${OVERPASS_SERVERS[i + 1]}...)`);
    }
  }
  throw lastErr;
}

function elementToPlace(el) {
  const lat = el.lat ?? el.center?.lat;
  const lon = el.lon ?? el.center?.lon;
  const tags = el.tags || {};
  const name = tags.name || 'Unnamed';
  const street = tags['addr:street'] || tags['addr:full'] || '';
  const city = tags['addr:city'] || tags['addr:town'] || '';
  const state = tags['addr:state'] || '';
  const pincode = tags['addr:postcode'] || '';
  return {
    name,
    latitude: lat ? parseFloat(lat) : null,
    longitude: lon ? parseFloat(lon) : null,
    address: { street, city, state, pincode, area: tags['addr:suburb'] || '' },
    phone: tags.phone || tags['contact:phone'] || '',
    osmId: el.id,
    osmType: el.type
  };
}

async function main() {
  const [s, w, n, e] = BBOX.split(',').map(Number);
  const bbox = `${s},${w},${n},${e}`;

  console.log('Fetching from OpenStreetMap (Overpass API)...');
  console.log('Bbox:', bbox);
  console.log('');

  let bloodBanks = [];
  let hospitals = [];

  try {
    // Blood banks: try multiple OSM tag schemes (India uses healthcare=blood_bank; global uses amenity=blood_bank / healthcare=blood_donation)
    const bloodTagQueries = [
      ['healthcare', 'blood_bank'],
      ['healthcare', 'blood_donation'],
      ['amenity', 'blood_bank']
    ];
    const seenIds = new Set();
    for (const [k, v] of bloodTagQueries) {
      try {
        const res = await overpassQueryWithRetry(bbox, k, v);
        (res.elements || []).forEach(el => {
          const p = elementToPlace(el);
          if (p.latitude && p.longitude && !seenIds.has(`${p.osmType}-${p.osmId}`)) {
            seenIds.add(`${p.osmType}-${p.osmId}`);
            bloodBanks.push(p);
          }
        });
      } catch (_) {}
    }
    // Name search: "blood bank" (catches facilities not tagged as blood_bank)
    try {
      const nameRes = await overpassQueryByNameWithRetry(bbox, 'blood bank');
      (nameRes.elements || []).forEach(el => {
        const p = elementToPlace(el);
        if (p.latitude && p.longitude && !seenIds.has(`${p.osmType}-${p.osmId}`)) {
          seenIds.add(`${p.osmType}-${p.osmId}`);
          bloodBanks.push(p);
        }
      });
    } catch (_) {}

    // Hospitals
    const hospRes = await overpassQueryWithRetry(bbox, 'amenity', 'hospital');
    hospitals = (hospRes.elements || []).map(elementToPlace).filter(p => p.latitude && p.longitude);
  } catch (err) {
    console.error('Overpass API error:', err.message);
    process.exit(1);
  }

  console.log('Blood banks (OSM):', bloodBanks.length);
  bloodBanks.slice(0, 5).forEach(p => console.log('  -', p.name, p.latitude, p.longitude));
  console.log('Hospitals (OSM):', hospitals.length);
  hospitals.slice(0, 5).forEach(p => console.log('  -', p.name, p.latitude, p.longitude));
  console.log('');

  if (DRY_RUN) {
    console.log('DRY_RUN=1: not writing to DB. Remove DRY_RUN or set DRY_RUN=0 to import.');
    process.exit(0);
  }

  await mongoose.connect(MONGO_URI);
  const User = require('../models/User');

  const defaultPassword = process.env.SEED_PASSWORD || 'password123';

  for (const p of bloodBanks) {
    const existing = await User.findOne({ role: 'bloodbank', name: p.name }).lean();
    if (existing) {
      await User.updateOne(
        { _id: existing._id },
        { $set: { latitude: p.latitude, longitude: p.longitude, address: p.address } }
      );
      console.log('Updated blood bank:', p.name);
    } else {
      await User.create({
        name: p.name,
        email: `osm-blood-${p.osmId}@lifelink.local`,
        password: defaultPassword,
        role: 'bloodbank',
        phone: p.phone || '',
        address: p.address,
        latitude: p.latitude,
        longitude: p.longitude
      });
      console.log('Created blood bank:', p.name);
    }
  }

  for (const p of hospitals) {
    const existing = await User.findOne({ role: 'hospital', name: p.name }).lean();
    if (existing) {
      await User.updateOne(
        { _id: existing._id },
        { $set: { latitude: p.latitude, longitude: p.longitude, address: p.address } }
      );
      console.log('Updated hospital:', p.name);
    } else {
      await User.create({
        name: p.name,
        email: `osm-hosp-${p.osmId}@lifelink.local`,
        password: defaultPassword,
        role: 'hospital',
        phone: p.phone || '',
        address: p.address,
        latitude: p.latitude,
        longitude: p.longitude
      });
      console.log('Created hospital:', p.name);
    }
  }

  console.log('Done.');
  await mongoose.disconnect();
  process.exit(0);
}

main().catch((e) => { console.error(e); process.exit(1); });
