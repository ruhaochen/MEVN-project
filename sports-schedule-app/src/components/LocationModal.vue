<script setup>
import { ref, onMounted, onUnmounted, nextTick } from 'vue';
import { Loader } from '@googlemaps/js-api-loader';

const props = defineProps({
  locationAddress: {
    type: String,
    required: true
  }
});

const emit = defineEmits(['close']);
const isActive = ref(true);
const loading = ref(true);
const mapContainer = ref(null);
const errorMessage = ref('');
let map = null;

// Predefined locations
const predefinedLocations = {
  'us-gym': {
    address: '85 Moatfield Drive, Toronto, ON M3B 3L6, Canada',
    coordinates: { lat: 43.7671, lng: -79.3473 }
  },
  'prep-gym': {
    address: '85 Moatfield Drive, Toronto, ON M3B 3L6, Canada',
    coordinates: { lat: 43.7671, lng: -79.3473 }
  }
};

const close = () => {
  emit('close');
};

// async function initMap(coords, address) {
//   await nextTick(); // Ensure DOM is updated
  
//   if (!mapContainer.value) {
//     console.error('Map container not found');
//     errorMessage.value = 'Map failed to load. Please try again.';
//     loading.value = false;
//     return;
//   }

//   try {
//     map = new google.maps.Map(mapContainer.value, {
//       center: coords,
//       zoom: 16,
//       styles: [
//         {
//           featureType: 'poi',
//           elementType: 'labels',
//           stylers: [{ visibility: 'off' }]
//         }
//       ]
//     });
    
//     new google.maps.Marker({
//       position: coords,
//       map: map,
//       title: address
//     });
//   } catch (err) {
//     console.error('Map initialization error:', err);
//     errorMessage.value = 'Failed to initialize map.';
//   }
// }

const initMap = async (coords, address) => {
  await nextTick();
  
  if (!mapContainer.value) {
    console.error('Map container not found');
    errorMessage.value = 'Map failed to load. Please try again.';
    loading.value = false;
    return;
  }

  try {
    // Check if we have valid coordinates
    if (!coords || !coords.lat || !coords.lng) {
      throw new Error('Invalid coordinates');
    }

    map = new google.maps.Map(mapContainer.value, {
      center: coords,
      zoom: 16,
      styles: [
        {
          featureType: 'poi',
          elementType: 'labels',
          stylers: [{ visibility: 'off' }]
        }
      ]
    });
    
    new google.maps.Marker({
      position: coords,
      map: map,
      title: address
    });
  } catch (err) {
    console.error('Map initialization error:', err);
    // Fallback to Bayview Glen
    errorMessage.value = `Could not find "${props.locationAddress}". Showing Bayview Glen instead.`;
    await initMap(
      predefinedLocations['us-gym'].coordinates, 
      predefinedLocations['us-gym'].address
    );
  }
};

onMounted(async () => {
  try {
    // Check if we have a valid location address
    if (!props.locationAddress || props.locationAddress.trim() === '') {
      throw new Error('No location specified');
    }
    
    // Get API key from backend
    const { key } = await fetch('https://mevn-project-vjik.onrender.com/api/maps-key')
      .then(res => res.json());
    
    // Load Google Maps
    const loader = new Loader({
      apiKey: key,
      version: 'weekly',
      libraries: ['places']
    });

    await loader.load();
    
    // Check if location is one of our predefined gyms
    const predefined = predefinedLocations[props.locationAddress];
    
    if (predefined) {
      await initMap(predefined.coordinates, predefined.address);
      loading.value = false;
      return;
    }

    // Handle opposing gym addresses
    const geocoder = new google.maps.Geocoder();
    geocoder.geocode({ address: props.locationAddress }, async (results, status) => {
      if (status === 'OK' && results[0]) {
        await initMap(results[0].geometry.location, props.locationAddress);
      } else {
        errorMessage.value = `Could not find "${props.locationAddress}". Showing Bayview Glen instead.`;
        await initMap(
          predefinedLocations['us-gym'].coordinates,
          predefinedLocations['us-gym'].address
        );
      }
      loading.value = false;
    });

  } catch (error) {
    console.error('Error loading Google Maps:', error);
    errorMessage.value = 'Failed to load map service. Please try again later.';
    loading.value = false;
  }
});

onUnmounted(() => {
  if (map) {
    google.maps.event.clearInstanceListeners(map);
  }
});

const openInGoogleMaps = () => {
  let addressToUse;
  
  if (errorMessage.value) {
    addressToUse = predefinedLocations['us-gym'].address;
  } else {
    addressToUse = props.locationAddress;
  }

  // Detect if user is on mobile
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
  const encodedAddress = encodeURIComponent(addressToUse);
  
  if (isMobile) {
    // Try to open directly in Google Maps app
    window.location.href = `https://maps.google.com/maps?q=${encodedAddress}`;
  } else {
    // Desktop - open in new tab
    window.open(`https://www.google.com/maps/search/?api=1&query=${encodedAddress}`, '_blank');
  }
};
</script>

<template>
    <div class="modal" :class="{ 'is-active': isActive }">
      <div class="modal-background" @click="close"></div>
      <div class="modal-card">
        <header class="modal-card-head">
          <p class="modal-card-title">Location Map</p>
          <button class="delete" aria-label="close" @click="close"></button>
        </header>
        <section class="modal-card-body">
          <div v-if="loading" class="has-text-centered py-6">
            <span class="icon is-large">
              <i class="fas fa-spinner fa-pulse fa-2x"></i>
            </span>
            <p>Loading map...</p>
          </div>
  
          <!-- Always render the map container, but hide it if loading -->
          <div :class="{ 'is-hidden': loading }">
            <div v-if="errorMessage" class="notification is-warning mb-4">
              {{ errorMessage }}
            </div>
            <div ref="mapContainer" class="map-container"></div>
            <div class="content mt-4">
              <p class="has-text-centered">
                <span 
                  class="icon-text is-align-items-center" 
                  @click="openInGoogleMaps" 
                  style="cursor: pointer;"
                >
                  <span class="icon">
                    <i class="fas fa-map-marker-alt has-text-danger"></i>
                  </span>
                  <span class="is-inline-block">
                    {{ errorMessage ? '85 Moatfield Drive, Toronto, ON' : locationAddress }}
                  </span>
                </span>
              </p>
            </div>
          </div>
        </section>
        <footer class="modal-card-foot">
          <button class="button" @click="close">Close</button>
        </footer>
      </div>
    </div>
  </template>
  

<style scoped>
.map-container {
  height: 400px;
  width: 100%;
  border-radius: 4px;
  overflow: hidden;
  background-color: #f5f5f5;
}

.modal-card {
  max-width: 600px;
  width: 90%;
}

.modal-card-body {
  padding: 0;
}

.modal-card-body > div {
  padding: 1.5rem;
}

.icon-text {
  transition: transform 0.1s;
  display: inline-flex; /* Better for mobile touch targets */
  padding: 4px 8px; /* Larger touch area */
  border-radius: 4px; /* Visual feedback area */
}

.icon-text.is-active {
  transform: scale(0.98);
  background-color: #f5f5f5;
}

@media (max-width: 768px) {
  .icon-text {
    padding: 8px 12px;
  }
}

.icon-text:hover {
  text-decoration: underline;
  color: #3273dc;
}

.icon-text {
  display: inline-flex;
  align-items: center;
}

.icon {
  margin-right: 0.5rem;
}

@media (max-width: 768px) {
  .icon-text {
    flex-wrap: nowrap; 
  }
}

</style>