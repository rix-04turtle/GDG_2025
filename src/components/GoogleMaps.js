import React, { useState, useEffect, useCallback } from 'react';
import { GoogleMap, useJsApiLoader, Marker } from '@react-google-maps/api';

const containerStyle = {
  width: '100%',
  height: '300px',
  borderRadius: '0.5rem',
};

const libraries = ['places'];

const GoogleMaps = ({ onLocationChange }) => {
  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
    libraries,
  });

  const [center, setCenter] = useState({ lat: 20.5937, lng: 78.9629 }); // Default center (India)
  const [markerPosition, setMarkerPosition] = useState(center);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          const currentLocation = { lat: latitude, lng: longitude };
          setCenter(currentLocation);
          setMarkerPosition(currentLocation);
          onLocationChange({ latitude, longitude });
        },
        () => {
          // Handle error or if user denies location access
          // The map will remain centered on the default location
          onLocationChange({ latitude: center.lat, longitude: center.lng });
        }
      );
    } else {
      // Geolocation not supported
      onLocationChange({ latitude: center.lat, longitude: center.lng });
    }
  }, []); // Empty dependency array ensures this runs only once on mount

  const onMarkerDragEnd = (e) => {
    const newPos = {
      lat: e.latLng.lat(),
      lng: e.latLng.lng(),
    };
    setCenter(newPos); // Re-center the map on the new marker position
    setMarkerPosition(newPos);
    onLocationChange({ latitude: newPos.lat, longitude: newPos.lng });
  };

  if (loadError) {
    return <div>Error loading maps. Please check your API key and network connection.</div>;
  }

  if (!isLoaded) {
    return <div>Loading Map...</div>;
  }

  return (
    <GoogleMap
      mapContainerStyle={containerStyle}
      center={center}
      zoom={15}
    >
      <Marker
        position={markerPosition}
        draggable={true}
        onDragEnd={onMarkerDragEnd}
      />
    </GoogleMap>
  );
};

export default React.memo(GoogleMaps);