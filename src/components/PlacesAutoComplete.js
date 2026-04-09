import React, { useState } from 'react';
import { GoogleMap, LoadScript, Autocomplete } from '@react-google-maps/api';
import './places.css'
const libraries = ['places'];

const PlacesAutocomplete = ({ onPlaceSelected }) => {
  const [autocomplete, setAutocomplete] = useState(null);

  const onLoad = (autocomplete) => {
    setAutocomplete(autocomplete);
  };

  const onPlaceChanged = () => {
    if (autocomplete !== null) {
      const place = autocomplete.getPlace();
      onPlaceSelected(place);
    }
  };

  return (
    <Autocomplete
      onLoad={onLoad}
      onPlaceChanged={onPlaceChanged}
      types={['(regions)']}
    >
      <input
        type="text"
        placeholder="Enter a location"
        className="form-control"
        style={{ width: '100%' }}
      />
    </Autocomplete>
  );
};

export default PlacesAutocomplete