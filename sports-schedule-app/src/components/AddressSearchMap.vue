<template>
  <div class="map-container">
    <input
      v-model="address"
      @keyup.enter="geocodeAddress"
      type="text"
      placeholder="Enter an address"
      class="address-input"
    />
    <button @click="geocodeAddress" class="search-button" :disabled="isLoading">
      {{ isLoading ? 'Searching...' : 'Find' }}
    </button>
    
    <div v-if="errorMessage" class="error-message">
      {{ errorMessage }}
    </div>

    <div v-if="formattedAddress" class="matched-address">
      Matched address: {{ formattedAddress }}
    </div>

    <GMapMap
      ref="mapRef"
      :center="mapCenter"
      :zoom="15"
      style="width: 100%; height: 500px"
      @loaded="onMapLoaded"
    >
      <GMapMarker 
        v-if="markerPosition" 
        :position="markerPosition" 
        :options="{ advancedMarker: true }"
      />
    </GMapMap>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const address = ref('');
const mapCenter = ref({ lat: 43.6532, lng: -79.3832 });
const markerPosition = ref(null);
const formattedAddress = ref('');
const isLoading = ref(false);
const errorMessage = ref('');
const mapRef = ref(null);

const geocodeAddress = async () => {
  if (!address.value.trim()) {
    errorMessage.value = 'Please enter an address';
    return;
  }

  isLoading.value = true;
  errorMessage.value = '';
  formattedAddress.value = '';
  
  try {
    const response = await fetch(`http://localhost:3000/api/geocode?address=${encodeURIComponent(address.value)}`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    if (!data.success) {
      throw new Error(data.error || 'No results found for that address');
    }

    // Update map and marker positions
    const location = data.location;
    mapCenter.value = location;
    markerPosition.value = location;
    formattedAddress.value = data.formattedAddress;

    // Adjust map viewport if available
    if (data.viewport && mapRef.value?.map) {
      const bounds = new google.maps.LatLngBounds(
        new google.maps.LatLng(data.viewport.southwest.lat, data.viewport.southwest.lng),
        new google.maps.LatLng(data.viewport.northeast.lat, data.viewport.northeast.lng)
      );
      mapRef.value.map.fitBounds(bounds);
    }
  } catch (error) {
    console.error('Geocoding error:', error);
    errorMessage.value = error.message || 'Could not find location. Please try a different address.';
  } finally {
    isLoading.value = false;
  }
};

const onMapLoaded = () => {
  console.log('Map loaded successfully');
};
</script>

<style scoped>
.map-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 1rem;
}
.address-input {
  width: 70%;
  padding: 0.5rem;
  margin-right: 0.5rem;
  font-size: 1rem;
}
.search-button {
  padding: 0.5rem 1rem;
  font-size: 1rem;
  cursor: pointer;
}
.search-button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}
.matched-address {
  margin: 0.5rem 0;
  padding: 0.5rem;
  background: #f0f0f0;
  border-radius: 4px;
  font-size: 0.9rem;
}
.error-message {
  margin: 0.5rem 0;
  padding: 0.5rem;
  background: #ffebee;
  color: #c62828;
  border-radius: 4px;
  font-size: 0.9rem;
}
</style>