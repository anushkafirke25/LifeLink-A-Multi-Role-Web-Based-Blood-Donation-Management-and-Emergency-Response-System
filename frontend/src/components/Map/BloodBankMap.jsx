import React, { useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix default icon paths for Leaflet in Webpack/CRA
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

const UserLocationMarker = ({ position }) => {
  const map = useMap();
  useMemo(() => {
    if (position) {
      map.setView([position.lat, position.lng], 13);
    }
  }, [position, map]);

  if (!position) return null;

  return (
    <Marker
      position={[position.lat, position.lng]}
      icon={L.divIcon({
        className: 'user-location-marker',
        html: '<div class="w-4 h-4 bg-blue-600 rounded-full border-2 border-white shadow-lg"></div>',
        iconSize: [16, 16],
        iconAnchor: [8, 8],
      })}
    />
  );
};

const BloodBankMap = ({ userLocation, bloodBanks, selectedBankId, onSelectBank, travelDistances }) => {
  const banksWithCoords = (bloodBanks || []).filter(
    (b) => typeof b.latitude === 'number' && typeof b.longitude === 'number'
  );

  // Default center: user location if available, else first bank, else India approx
  const initialCenter = userLocation
    ? [userLocation.lat, userLocation.lng]
    : banksWithCoords.length > 0
    ? [banksWithCoords[0].latitude, banksWithCoords[0].longitude]
    : [20.5937, 78.9629];

  const activeBank = banksWithCoords.find((b) => (b._id || b.id) === selectedBankId) || null;

  return (
    <div className="w-full h-80 md:h-[420px] rounded-xl overflow-hidden shadow-lg bg-gray-100">
      <MapContainer
        center={initialCenter}
        zoom={userLocation ? 13 : 6}
        scrollWheelZoom={true}
        className="w-full h-full"
      >
        <TileLayer
          attribution="&copy; OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <UserLocationMarker position={userLocation} />
        {banksWithCoords.map((bank) => {
          const id = bank._id || bank.id;
          const effDist =
            (id && travelDistances && travelDistances[id]) != null
              ? travelDistances[id]
              : bank.distance;
          return (
            <Marker
              key={id}
              position={[bank.latitude, bank.longitude]}
              eventHandlers={{
                click: () => onSelectBank && onSelectBank(id),
              }}
            >
              <Popup>
                <div className="text-sm">
                  <div className="font-semibold mb-1">{bank.name}</div>
                  {bank.address && (
                    <div className="text-gray-600 mb-1">
                      {bank.address.street && <div>{bank.address.street}</div>}
                      {bank.address.area && <div>{bank.address.area}</div>}
                      <div>
                        {bank.address.city}, {bank.address.state} - {bank.address.pincode}
                      </div>
                    </div>
                  )}
                  {effDist != null && !isNaN(effDist) && (
                    <div className="text-blue-600 font-medium">
                      📍 {effDist.toFixed(1)} km
                    </div>
                  )}
                </div>
              </Popup>
            </Marker>
          );
        })}
        {activeBank && (
          <FlyToBank bank={activeBank} />
        )}
      </MapContainer>
    </div>
  );
};

const FlyToBank = ({ bank }) => {
  const map = useMap();
  useMemo(() => {
    if (bank && typeof bank.latitude === 'number' && typeof bank.longitude === 'number') {
      map.flyTo([bank.latitude, bank.longitude], 14, { duration: 0.8 });
    }
  }, [bank, map]);
  return null;
};

export default BloodBankMap;

