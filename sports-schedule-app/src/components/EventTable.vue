<script setup>
import { ref, onMounted, watch, computed } from "vue";
import LocationModal from "./LocationModal.vue";

const events = ref([]);
const leagues = ref([]);
const teams = ref([]);
const selectedLeagues = ref([]); 
const selectedTeam = ref("");
const selectedDateRange = ref("");
const showLocationModal = ref(false);
const selectedLocation = ref('');
const teamLocationCache = ref({});
const showMobileFilters = ref(false);

const props = defineProps({
    isAdmin:{
        type: Boolean,
        required: true
    }
});

const viewLocation = async (event) => {
  selectedLocation.value = await getLocationAddress(event);
  showLocationModal.value = true;
};

const getLocationAddress = async (event) => {
  // Handle school gyms
  if (['us-gym', 'prep-gym'].includes(event.location)) {
    return '85 Moatfield Drive, Toronto, ON M3B 3L6, Canada';
  }

  // Handle opposing gym - fetch team location
  if (event.location === 'opposing-gym') {
    if (event.opposingTeamId) {
      try {
        const team = await fetch(`https://mevn-project-vjik.onrender.com/api/teams/${event.opposingTeamId}`)
          .then(res => res.json());
        return team.data?.location || 'Address not available';
      } catch {
        return 'Could not load opponent address';
      }
    } else {
      return 'Opponent team not set for this event';
    }
  }

};

const fetchLeagues = async () => {
    const response = await fetch("https://mevn-project-vjik.onrender.com/api/leagues");
    leagues.value = await response.json();
};

const fetchTeams = async () => {
    const response = await fetch("https://mevn-project-vjik.onrender.com/api/teams");
    const allTeams = await response.json();
    
    // Group teams by name and collect their IDs
    const teamGroups = {};
    allTeams.forEach(team => {
        if (!teamGroups[team.name]) {
            teamGroups[team.name] = {
                name: team.name,
                school: team.school,
                ids: [],
                leagues: []
            };
        }
        teamGroups[team.name].ids.push(team._id);
        teamGroups[team.name].leagues.push(team.leagueId);
    });
    
    teams.value = Object.values(teamGroups);
};

const fetchEvents = async () => {
    let query = new URLSearchParams();

    // Add selected leagues to query
    if (selectedLeagues.value.length) {
        query.append("leagueIds", selectedLeagues.value.join(","));
    }

    // Add selected team to query
    if (selectedTeam.value) {
        query.append("opposingTeamId", selectedTeam.value.ids.join(","));
    }

    // Set date range based on selection
    let startDate, endDate;
    const today = new Date();
    switch (selectedDateRange.value) {
        case "today":
            startDate = endDate = today.toISOString().split("T")[0];
            break;
        case "tomorrow":
            const tomorrow = new Date();
            tomorrow.setDate(today.getDate() + 1);
            startDate = endDate = tomorrow.toISOString().split("T")[0];
            break;
        case "thisWeek":
            startDate = today.toISOString().split("T")[0];
            endDate = new Date(today.setDate(today.getDate() + 7)).toISOString().split("T")[0];
            break;
        case "nextWeek":
            const nextWeekStart = new Date();
            nextWeekStart.setDate(today.getDate() + 7);
            startDate = nextWeekStart.toISOString().split("T")[0];
            endDate = new Date(nextWeekStart.setDate(nextWeekStart.getDate() + 7)).toISOString().split("T")[0];
            break;
        case "thisSeason":
        case "nextSeason":
            query.append("dateRange", selectedDateRange.value);
            break;
    }
    if (startDate && endDate) {
        query.append("startDate", startDate);
        query.append("endDate", endDate);
    }
    const response = await fetch(`https://mevn-project-vjik.onrender.com/api/events?${query.toString()}`);
    events.value = await response.json();
};

// Fetch data when filters change
watch([selectedLeagues, selectedTeam, selectedDateRange], fetchEvents);

// Initial data fetch
onMounted(() => {
    fetchLeagues();
    fetchTeams();
    fetchEvents();
});

const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  const options = { year: 'numeric', month: 'short', day: 'numeric' };
  return new Date(dateString).toLocaleDateString(undefined, options);
};

const formatTime = (timeString) => {
  if (!timeString) return '';
  return new Date(`2000-01-01T${timeString}`).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const capitalizeWords = (str) => {
  return str.toLowerCase().replace(/\b\w/g, char => char.toUpperCase());
}

const groupedLeagues = computed(() => {
  const seasons = ['Fall', 'Winter', 'Spring'];
  return seasons.map(season => ({
    name: season,
    leagues: leagues.value.filter(l => l.season === season.toLowerCase())
  }));
});

const formatLeagueName = (league) => {
  return capitalizeWords(`${league.sport} ${league.ageGroup} ${league.division} ${league.gender}`);
};

const dateRanges = ref([
  { label: 'Today', value: 'today' },
  { label: 'Tomorrow', value: 'tomorrow' },
  { label: 'This Week', value: 'thisWeek' },
  { label: 'Next Week', value: 'nextWeek' },
  { label: 'This Season', value: 'thisSeason' },
  { label: 'Next Season', value: 'nextSeason' }
]);
</script>

<template>
  <div class="event-table-container">
    <!-- Team Filter -->
    <div class="box filter-box mb-3">
      <div class="field">
        <label class="label has-text-light is-hidden-mobile">Filter by Opposing Team</label>
        <label class="label has-text-light is-hidden-tablet">Team Filter</label>
        <div class="control has-icons-left">
          <div class="select is-fullwidth is-medium-mobile">
              <select v-model="selectedTeam">
                  <option :value="null">All Teams</option>
                  <option v-for="team in teams" :key="team.name" :value="team">
                      {{ team.name }} - {{ team.school }}
                      <span v-if="team.leagues.length > 1">({{ team.leagues.length }})</span>
                  </option>
              </select>
          </div>
          <span class="icon is-left">
            <i class="fas fa-filter"></i>
          </span>
        </div>
      </div>
    </div>

    <!-- Date Range Buttons -->
    <div class="field is-grouped is-grouped-multiline mb-4">
      <div class="control" v-for="range in dateRanges" :key="range.value">
        <button
          class="button is-small-mobile"
          :class="{
            'is-info': selectedDateRange !== range.value,
            'is-primary': selectedDateRange === range.value
          }"
          @click="selectedDateRange = selectedDateRange === range.value ? '' : range.value">
          {{ range.label }}
        </button>
      </div>
    </div>

    <!-- Main Content -->
    <div class="columns is-desktop is-gapless is-mobile">
      <!-- League Filter Column -->
      <div class="column is-3-widescreen is-4-desktop is-12-mobile">
        <div class="box filter-box sidebar-box is-hidden-mobile">
          <h3 class="title is-5 has-text-light mb-5">
            <span class="icon-text">
              <span class="icon">
                <i class="fas fa-trophy"></i>
              </span>
              <span>Leagues</span>
            </span>
          </h3>
          
          <div v-for="season in groupedLeagues" :key="season.name" class="mb-5">
            <h4 class="subtitle is-6 has-text-weight-semibold mb-4 has-text-info">
              <span class="icon is-small">
                <i class="fas fa-calendar"></i>
              </span>
              {{ season.name }}
            </h4>
            
            <div class="league-options has-text-left">
              <div class="field" v-for="league in season.leagues" :key="league._id">
                <input 
                  :id="'league-' + league._id"
                  type="checkbox" 
                  :value="league._id" 
                  v-model="selectedLeagues"
                  class="is-checkradio is-info"
                  :checked="selectedLeagues.includes(league._id)">
                <label :for="'league-' + league._id" class="has-text-light">
                  {{ formatLeagueName(league) }}
                </label>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Mobile league filter toggle -->
        <button class="button is-fullwidth is-info is-outlined mb-3 is-hidden-tablet"
                @click="showMobileFilters = !showMobileFilters">
          <span class="icon">
            <i class="fas fa-filter"></i>
          </span>
          <span>Filter Leagues</span>
        </button>
        
        <!-- Mobile league filter dropdown -->
        <div class="box filter-box mb-3" v-if="showMobileFilters">
          <h3 class="title is-5 has-text-light mb-3">
            <span class="icon-text">
              <span class="icon">
                <i class="fas fa-trophy"></i>
              </span>
              <span>Leagues</span>
            </span>
          </h3>
          
          <div v-for="season in groupedLeagues" :key="season.name" class="mb-3">
            <h4 class="subtitle is-6 has-text-weight-semibold mb-2 has-text-info">
              <span class="icon is-small">
                <i class="fas fa-calendar"></i>
              </span>
              {{ season.name }}
            </h4>
            
            <div class="league-options-mobile">
              <div class="field" v-for="league in season.leagues" :key="league._id">
                <input 
                  :id="'mobile-league-' + league._id"
                  type="checkbox" 
                  :value="league._id" 
                  v-model="selectedLeagues"
                  class="is-checkradio is-info"
                  :checked="selectedLeagues.includes(league._id)">
                <label :for="'mobile-league-' + league._id" class="has-text-light">
                  {{ formatLeagueName(league) }}
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Events Column -->
      <div class="column is-9-widescreen is-8-desktop is-12-mobile">
        <div class="box content-box">
          <div class="level">
            <div class="level-left">
              <h3 class="title is-4 has-text-light is-size-5-mobile">
                <span class="icon-text">
                  <span class="icon">
                    <i class="fas fa-calendar-alt"></i>
                  </span>
                  <span>Upcoming Events</span>
                </span>
              </h3>
            </div>
          </div>

          <div class="table-container">
            <!-- Desktop table -->
            <table class="table is-fullwidth is-hoverable is-hidden-mobile">
              <thead>
                <tr>
                  <th class="has-text-light">Date</th>
                  <th class="has-text-light">Time</th>
                  <th class="has-text-light">Event</th>
                  <th class="has-text-light">Location</th>
                  <th class="has-text-light">Opponent</th>
                  <th class="has-text-light">Notes</th>
                  <th class="has-text-light">Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="event in events" :key="event._id">
                  <td class="has-text-light">{{ formatDate(event.date) }}</td>
                  <td class="has-text-light">{{ formatTime(event.time) }}</td>
                  <td class="has-text-light">{{ capitalizeWords(event.type) }}</td>
                  <td class="has-text-light">{{ event.location }}</td>
                  <td class="has-text-light">{{ event.opposingTeam }}</td>
                  <td class="has-text-light">{{ event.notes }}</td>
                  <td>
                    <div class="buttons are-small">
                      <button 
                        class="button is-info is-outlined" 
                        title="View Location"
                        @click="viewLocation(event)"
                      >
                        <span class="icon">
                          <i class="fas fa-map-marker-alt"></i>
                        </span>
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
            
            <!-- Mobile cards view -->
            <div class="is-hidden-tablet">
              <div v-for="event in events" :key="event._id" class="card mb-3 event-card">
                <div class="card-content">
                  <div class="media">
                    <div class="media-content">
                      <p class="title is-5 has-text-light">{{ capitalizeWords(event.type) }}</p>
                      <p class="subtitle is-6 has-text-info">
                        {{ formatDate(event.date) }} at {{ formatTime(event.time) }}
                      </p>
                    </div>
                  </div>
                  
                  <div class="content">
                    <p class="has-text-light">
                      <span class="icon-text">
                        <span class="icon has-text-info">
                          <i class="fas fa-map-marker-alt"></i>
                        </span>
                        <span>{{ event.location }}</span>
                      </span>
                    </p>
                    
                    <p class="has-text-light">
                      <span class="icon-text">
                        <span class="icon has-text-info">
                          <i class="fas fa-users"></i>
                        </span>
                        <span>vs {{ event.opposingTeam }}</span>
                      </span>
                    </p>
                    
                    <p v-if="event.notes" class="has-text-light mt-2">
                      <span class="icon-text">
                        <span class="icon has-text-info">
                          <i class="fas fa-sticky-note"></i>
                        </span>
                        <span>{{ event.notes }}</span>
                      </span>
                    </p>
                    
                    <div class="buttons mt-3">
                      <button 
                        class="button is-info is-outlined is-small" 
                        title="View Location"
                        @click="viewLocation(event)"
                      >
                        <span class="icon">
                          <i class="fas fa-map-marker-alt"></i>
                        </span>
                        <span>Location</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              
              <div v-if="!events.length" class="has-text-centered py-4">
                <div class="notification is-dark">
                  <span class="icon-text">
                    <span class="icon">
                      <i class="fas fa-calendar-times"></i>
                    </span>
                    <span>No events found</span>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  <LocationModal
    v-if="showLocationModal"
    :location-address="selectedLocation"
    @close="showLocationModal = false"
  />
</template>

<style scoped>
.event-table-container {
  padding: 0rem;
  background-color: #121212;
  min-height: calc(100vh - 4rem);
}

.filter-box {
  background-color: #1e1e1e;
  border: 1px solid #333;
  border-radius: 6px;
}

.sidebar-box {
  height: 100%;
  border-right: none;
  border-top-right-radius: 0;
  border-bottom-right-radius: 0;
}

.content-box {
  background-color: #1e1e1e;
  border: 1px solid #333;
  border-left: none;
  border-top-left-radius: 0;
  border-bottom-left-radius: 0;
  min-height: 70vh;
  padding: 1.25rem;
}

.table {
  background-color: #252525;
  color: #f5f5f5;
}

.table th {
  background-color: #2a2a2a;
  color: #f5f5f5;
  border-color: #333;
}

.table td {
  border-color: #333;
  vertical-align: middle;
}

.table.is-hoverable tbody tr:hover {
  background-color: #2d2d2d;
}

.league-options {
  max-height: 300px;
  overflow-y: auto;
  padding-right: 0.5rem;
}

.league-options-mobile {
  max-height: 200px;
  overflow-y: auto;
  padding-right: 0.5rem;
}

/* Custom scrollbar */
.league-options::-webkit-scrollbar,
.league-options-mobile::-webkit-scrollbar {
  width: 6px;
}

.league-options::-webkit-scrollbar-track,
.league-options-mobile::-webkit-scrollbar-track {
  background: #2a2a2a;
}

.league-options::-webkit-scrollbar-thumb,
.league-options-mobile::-webkit-scrollbar-thumb {
  background: #3273dc;
  border-radius: 3px;
}

/* Checkbox styling */
.is-checkradio[type="checkbox"] + label::before {
  border-color: #4a4a4a;
  background-color: #2a2a2a;
}

.is-checkradio[type="checkbox"]:checked + label::before {
  border-color: #3273dc;
  background-color: #3273dc;
}

/* Select dropdown styling */
.select select {
  background-color: #2a2a2a;
  color: #f5f5f5;
  border-color: #4a4a4a;
}

.select:not(.is-multiple):not(.is-loading)::after {
  border-color: #3273dc;
}

.button {
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.button:hover {
  transform: scale(1.05);
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.button:active {
  transform: scale(1.05);
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.sidebar-column {
  flex: none;
  width: 260px;
  max-width: 100%;
}

.league-options label,
.league-options-mobile label {
  padding-left: 0.4rem;
}

.league-options,
.league-options-mobile {
  line-height: 1.6;
}

.columns {
  margin-left: 0;
  margin-right: 0;
}

.event-table-container {
  overflow-x: hidden;
}

.table-container table tbody td {
  text-align: left;
}

/* Mobile-specific styles */
@media screen and (max-width: 768px) {
  .event-table-container {
    padding: 0.5rem;
  }
  
  .filter-box, .content-box {
    padding: 1rem;
  }
  
  .event-card {
    background-color: #252525;
    border: 1px solid #333;
  }
  
  .buttons .button {
    margin-bottom: 0.25rem;
  }
  
  .field.is-grouped {
    flex-wrap: wrap;
    overflow-x: auto;
    white-space: nowrap;
    padding-bottom: 0.5rem;
  }
  
  .field.is-grouped .control {
    display: inline-block;
    float: none;
    margin-bottom: 0.5rem;
  }
  
  /* Make sure select dropdowns are readable on mobile */
  .select select {
    max-width: 100%;
  }
  
  /* Adjust table container for mobile */
  .table-container {
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
  }
  
  /* Mobile-specific button sizing */
  .button.is-small-mobile {
    font-size: 0.75rem;
    padding: 0.25em 0.5em;
  }
  
  .select.is-medium-mobile select {
    font-size: 1rem;
    height: 2.25em;
  }
}

/* Ensure cards have proper spacing */
.event-card:not(:last-child) {
  margin-bottom: 1rem;
}
</style>