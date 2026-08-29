import React, { useState, useEffect } from 'react';
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';
import { locationService } from '../services/locationService';
import { toast } from 'react-toastify';
import './LocationPicker.css';

const LocationPicker = ({ onLocationSelect, initialLocation = null }) => {
  const [location, setLocation] = useState(initialLocation || { lat: 28.6139, lng: 77.2090 }); // Default: Delhi
  const [states, setStates] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [areas, setAreas] = useState([]);
  const [selectedState, setSelectedState] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [selectedArea, setSelectedArea] = useState('');
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchStates();
  }, []);

  const fetchStates = async () => {
    try {
      const response = await locationService.getStates();
      setStates(response.data || []);
    } catch (error) {
      toast.error('Failed to load states');
    }
  };

  const handleStateChange = async (e) => {
    const stateId = e.target.value;
    setSelectedState(stateId);
    setSelectedDistrict('');
    setSelectedArea('');
    setDistricts([]);
    setAreas([]);

    if (stateId) {
      try {
        const response = await locationService.getDistrictsByState(stateId);
        setDistricts(response.data || []);
      } catch (error) {
        toast.error('Failed to load districts');
      }
    }
  };

  const handleDistrictChange = async (e) => {
    const districtId = e.target.value;
    setSelectedDistrict(districtId);
    setSelectedArea('');
    setAreas([]);

    if (districtId) {
      try {
        const response = await locationService.getAreasByDistrict(districtId);
        setAreas(response.data || []);
      } catch (error) {
        toast.error('Failed to load areas');
      }
    }
  };

  const handleMapClick = (e) => {
    const newLocation = {
      lat: e.latLng.lat(),
      lng: e.latLng.lng()
    };
    setLocation(newLocation);
    reverseGeocode(newLocation);
  };

  const reverseGeocode = async (loc) => {
    setLoading(true);
    try {
      const response = await locationService.reverseGeocode(loc.lat, loc.lng);
      setAddress(response.address || '');
      onLocationSelect({
        latitude: loc.lat,
        longitude: loc.lng,
        address: response.address
      });
    } catch (error) {
      toast.error('Failed to get address');
    } finally {
      setLoading(false);
    }
  };

  const handleGetCurrentLocation = async () => {
    setLoading(true);
    try {
      const currentLoc = await locationService.getCurrentLocation();
      setLocation({ lat: currentLoc.latitude, lng: currentLoc.longitude });
      reverseGeocode(currentLoc);
      toast.success('Current location detected');
    } catch (error) {
      toast.error('Failed to get current location');
    } finally {
      setLoading(false);
    }
  };

  const googleMapsApiKey = process.env.REACT_APP_GOOGLE_MAPS_API_KEY || 'YOUR_API_KEY';

  return (
    <div className="location-picker">
      <div className="location-controls">
        <div className="row mb-3">
          <div className="col-md-6">
            <label className="form-label fw-bold">State</label>
            <select
              className="form-select"
              value={selectedState}
              onChange={handleStateChange}
            >
              <option value="">Select State</option>
              {states.map((state) => (
                <option key={state.id} value={state.id}>
                  {state.name}
                </option>
              ))}
            </select>
          </div>
          <div className="col-md-6">
            <label className="form-label fw-bold">District</label>
            <select
              className="form-select"
              value={selectedDistrict}
              onChange={handleDistrictChange}
              disabled={!selectedState}
            >
              <option value="">Select District</option>
              {districts.map((district) => (
                <option key={district.id} value={district.id}>
                  {district.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mb-3">
          <label className="form-label fw-bold">Area/Zone</label>
          <select
            className="form-select"
            value={selectedArea}
            onChange={(e) => setSelectedArea(e.target.value)}
            disabled={!selectedDistrict}
          >
            <option value="">Select Area</option>
            {areas.map((area) => (
              <option key={area.id} value={area.id}>
                {area.name}
              </option>
            ))}
          </select>
        </div>

        <button
          className="btn btn-outline-primary mb-3 w-100"
          onClick={handleGetCurrentLocation}
          disabled={loading}
        >
          📍 Use Current Location
        </button>
      </div>

      <div className="map-container">
        <LoadScript googleMapsApiKey={googleMapsApiKey}>
          <GoogleMap
            mapContainerStyle={{
              height: '400px',
              width: '100%',
              borderRadius: '8px'
            }}
            center={location}
            zoom={13}
            onClick={handleMapClick}
          >
            <Marker
              position={location}
              title="Report Location"
            />
          </GoogleMap>
        </LoadScript>
      </div>

      <div className="location-info mt-3">
        <div className="alert alert-info">
          <strong>📍 Address:</strong>
          <p>{address || 'Click on map or select location to get address'}</p>
        </div>
      </div>
    </div>
  );
};

export default LocationPicker;
