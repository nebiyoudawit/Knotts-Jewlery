// components/LocationPickerMap.jsx
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import { useEffect, useState } from 'react';
import L from 'leaflet';
import axios from 'axios';

const markerIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

const LocationPickerMap = ({ onAddressSelect }) => {
  const [position, setPosition] = useState(null);

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        const { latitude, longitude } = coords;
        setPosition([latitude, longitude]);

        // Reverse geocoding with Nominatim
        try {
          const response = await axios.get('https://nominatim.openstreetmap.org/reverse', {
            params: {
              lat: latitude,
              lon: longitude,
              format: 'json',
            },
          });
          const address = response.data.display_name || `${latitude}, ${longitude}`;
          onAddressSelect(address);
        } catch {
          onAddressSelect(`${latitude}, ${longitude}`);
        }
      },
      (err) => {
        console.error('Geolocation error:', err);
      }
    );
  }, [onAddressSelect]);

  return (
    <MapContainer
      center={position || [0, 0]}
      zoom={position ? 13 : 2}
      scrollWheelZoom={true}
      style={{ height: 300, width: '100%' }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {position && <Marker position={position} icon={markerIcon} />}
    </MapContainer>
  );
};

export default LocationPickerMap;
