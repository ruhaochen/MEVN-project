<script setup>
import { ref, watchEffect, onMounted } from 'vue';
import * as jwt_decode from 'jwt-decode';
import { Loader } from '@googlemaps/js-api-loader';
import { useToast } from '../../composables/useToast';

const { showToast } = useToast();

const props = defineProps({
  initialData: {
    type: Object,
    default: null
  },
  isModal: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['team-created']);

const league = ref("");
const name = ref("");
const school = ref("");
const location = ref("");
const leagues = ref([]);
const locationInput = ref(null);
let autocomplete = null;

onMounted(async () => {
  // Get API key from backend
  const { key } = await fetch('https://mevn-project-vjik.onrender.com/api/maps-key').then(res => res.json());
  
  // Initialize Google Places Autocomplete
  const loader = new Loader({
    apiKey: key,
    version: 'weekly',
    libraries: ['places']
  });

  await loader.load();
  
  autocomplete = new google.maps.places.Autocomplete(
    locationInput.value,
    { types: ['establishment', 'geocode'] }
  );
  
  autocomplete.addListener('place_changed', () => {
    const place = autocomplete.getPlace();
    if (place.formatted_address) {
      location.value = place.formatted_address;
    }
  });
});

// Initialize form for edit mode
watchEffect(() => {
  if (props.initialData) {
    league.value = leagues.value.find(l => l._id === props.initialData.leagueId);
    name.value = props.initialData.name;
    school.value = props.initialData.school;
    location.value = props.initialData.location;
  }
});

const fetchLeagues = async () => {
  try {
    const response = await fetch("https://mevn-project-vjik.onrender.com/api/leagues");
    leagues.value = await response.json();
  } catch (error) {
    console.error("Error fetching leagues:", error);
  }
};

const capitalizeWords = (str) => {
  return str?.toLowerCase().replace(/\b\w/g, char => char.toUpperCase()) || '';
};

const saveTeam = async () => {
  try {
    const method = props.initialData ? "PUT" : "POST";
    const url = props.initialData 
      ? `https://mevn-project-vjik.onrender.com/api/teams/${props.initialData._id}`
      : "https://mevn-project-vjik.onrender.com/api/teams";

    const response = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        leagueId: league.value?._id,
        name: name.value,
        school: school.value,
        location: location.value
      })
    });

    if (!response.ok) throw new Error("Failed to save team");
    
    showToast("Team saved successfully!");
    emit('team-created');
    
    if (!props.isModal) {
      // Reset form if in page mode
      league.value = "";
      name.value = "";
      school.value = "";
      location.value = "";
    }
  } catch (error) {
    console.error("Error saving team:", error);
    showToast("Failed to save team");
  }
};

onMounted(fetchLeagues);
</script>

<template>
  <form @submit.prevent="saveTeam">
    <div class="columns is-multiline">
      <!-- League -->
      <div class="column is-full">
        <div class="field">
          <label class="label">League</label>
          <div class="control">
            <div class="select is-fullwidth">
              <select v-model="league" required :class="{'placeholder': !league}">
                <option value="" disabled hidden>Select League</option>
                <option v-for="l in leagues" :key="l._id" :value="l">
                  {{ capitalizeWords(l.sport + " " + l.ageGroup + " " + l.division + " " + l.gender) }}
                </option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <!-- Team Name -->
      <div class="column is-half">
        <div class="field">
          <label class="label">Team Name</label>
          <div class="control">
            <input 
              v-model="name" 
              class="input" 
              type="text" 
              placeholder="e.g., Gryphons" 
              required
            />
          </div>
        </div>
      </div>

      <!-- School Name -->
      <div class="column is-half">
        <div class="field">
          <label class="label">School Name</label>
          <div class="control">
            <input 
              v-model="school" 
              class="input" 
              type="text" 
              placeholder="e.g., Bayview Glen" 
              required
            />
          </div>
        </div>
      </div>

      <!-- Location -->
      <div class="column is-full">
        <div class="field">
          <label class="label">Location</label>
          <div class="control has-icons-right">
            <input
              ref="locationInput"
              v-model="location"
              class="input"
              type="text"
              placeholder="Enter address or location"
              required
            />
            <span class="icon is-small is-right">
              <i class="fas fa-map-marker-alt"></i>
            </span>
          </div>
          <p class="help">Start typing to see suggestions from Google Maps</p>
        </div>
      </div>
    </div>

    <div class="field">
      <div class="control">
        <button type="submit" class="button is-primary is-fullwidth">
          {{ initialData ? 'Update Team' : 'Create Team' }}
        </button>
      </div>
    </div>
  </form>
</template>

<style scoped>
select.placeholder {
  color: #54565A;
}
.help {
  color: #7a7a7a;
  font-size: 0.75rem;
}
</style>