<script setup>
import { ref, computed, onMounted } from 'vue';
import * as jwt_decode from 'jwt-decode';
import EventForm from '../components/forms/EventForm.vue';

const events = ref([]);
const leagues = ref([]);
const editingEvent = ref(null);

const isAdmin = computed(() => {
  const token = localStorage.getItem('token');
  if (!token) return false;
  try {
    const decoded = jwt_decode.jwtDecode(token);
    return decoded.isAdmin === true;
  } catch (err) {
    return false;
  }
});

const fetchEvents = async () => {
  try {
    const response = await fetch("https://mevn-project-vjik.onrender.com/api/events");
    events.value = await response.json();
  } catch (error) {
    console.error("Error fetching events:", error);
  }
};

const fetchLeagues = async () => {
    try {
      const response = await fetch("https://mevn-project-vjik.onrender.com/api/leagues");
      leagues.value = await response.json();
    } catch (error) {
      console.error("Error fetching leagues:", error);
    }
};

const deleteEvent = async (id) => {
  if (!confirm("Are you sure you want to delete this event?")) return;
  
  try {
    const response = await fetch(`https://mevn-project-vjik.onrender.com/api/events/${id}`, {
      method: "DELETE"
    });
    
    if (!response.ok) throw new Error("Failed to delete");
    refreshEvents();
    alert("Event deleted successfully!");
  } catch (error) {
    alert("Error deleting event");
    console.error(error);
  }
};

const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  const options = { year: 'numeric', month: 'short', day: 'numeric' };
  return new Date(dateString).toLocaleDateString(undefined, options);
};

const formatTime = (timeString) => {
  if (!timeString) return '';
  return new Date(`2000-01-01T${timeString}`).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const getLocationName = (location) => {
  const locations = {
    'us-gym': 'Upper School Gym',
    'prep-gym': 'Prep School Gym'
  };
  return locations[location] || location;
};

const getLeagueName = (leagueId) => {
    const league = leagues.value.find(l => l._id === leagueId);
    if (!league) return 'N/A';
    return `${capitalizeWords(league.sport)} ${capitalizeWords(league.ageGroup)}`;
};

const capitalizeWords = (str) => {
  return str?.toLowerCase().replace(/\b\w/g, char => char.toUpperCase()) || '';
};

const openEditModal = (event) => {
  editingEvent.value = event;
};

const handleEventSaved = () => {
  fetchEvents();
  editingEvent.value = null;
};

const refreshEvents = () => {
  fetchEvents();
  fetchLeagues();
};

onMounted(async () => {
    await Promise.all([fetchEvents(), fetchLeagues()]);
});
</script>

<template>
    <div class="page-container">
      <div class="level">
        <div class="level-left">
          <h1 class="title has-text-light">Events Management</h1>
        </div>
      </div>
  
      <div class="box content-box mb-5">
        <EventForm :is-modal="false" @event-created="refreshEvents" />
      </div>
  
      <div class="box content-box">
        <div class="table-container">
          <table class="table is-fullwidth is-hoverable left-align">
            <thead>
              <tr>
                <th>League</th>
                <th>Date</th>
                <th>Time</th>
                <th>Type</th>
                <th>Opponent</th>
                <th>Location</th>
                <th>Notes</th>
                <th v-if="isAdmin">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="event in events" :key="event._id">
                <td data-label="League">{{ getLeagueName(event.leagueId) }}</td>
                <td data-label="Date">{{ formatDate(event.date) }}</td>
                <td data-label="Time">{{ formatTime(event.time) }}</td>
                <td data-label="Type">{{ capitalizeWords(event.type) }}</td>
                <td data-label="Opponent">{{ event.opposingTeam || 'Bayview Glen' }}</td>
                <td data-label="Location">{{ getLocationName(event.location) }}</td>
                <td data-label="Notes">{{ event.notes || '-' }}</td>
                <td v-if="isAdmin" class="actions-cell">
                  <div class="buttons are-small">
                    <button class="button is-info is-outlined" @click="openEditModal(event)">
                      <span class="icon">
                        <i class="fas fa-edit"></i>
                      </span>
                    </button>
                    <button @click="deleteEvent(event._id)" class="button is-danger is-outlined">
                      <span class="icon">
                        <i class="fas fa-trash"></i>
                      </span>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
  
      <!-- Edit Modal -->
      <div class="modal" :class="{ 'is-active': editingEvent }">
        <div class="modal-background" @click="editingEvent = null"></div>
        <div class="modal-card">
          <header class="modal-card-head">
            <p class="modal-card-title">Edit Event</p>
            <button class="delete" aria-label="close" @click="editingEvent = null"></button>
          </header>
          <section class="modal-card-body">
            <EventForm 
              :initial-data="editingEvent" 
              :is-modal="true" 
              @event-created="handleEventSaved" 
            />
          </section>
        </div>
      </div>
    </div>
</template>
  
<style scoped>
.page-container {
  padding: 1rem;
  background-color: #121212;
  min-height: 100vh;
}

.content-box {
  background-color: #1e1e1e;
  border: 1px solid #333;
  border-radius: 6px;
  overflow: hidden;
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

.modal-card {
  width: 90%;
  max-width: 800px;
}

.left-align th,
.left-align td {
  text-align: left;
}

.actions-cell {
  white-space: nowrap;
}

.buttons.are-small .button {
  margin-right: 0.25rem;
}

/* Mobile responsive styles */
@media (max-width: 768px) {
  .table thead {
    display: none;
  }

  .table tr {
    display: block;
    margin-bottom: 1.5rem; /* Increased from 1rem */
    border-bottom: 2px solid #444; /* Darker border */
    background-color: #2a2a2a; /* Slightly different background */
    border-radius: 8px; /* Rounded corners */
    overflow: hidden; /* Contain rounded corners */
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2); /* Subtle shadow */
    padding: 0.5rem 0; /* Add some vertical padding */
  }

  .table td {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.75rem 1rem;
    border: none;
    border-bottom: 1px solid #333;
  }

  .table td:last-child {
    border-bottom: none; /* Remove border from last cell */
  }

  .table td::before {
    content: attr(data-label);
    font-weight: bold;
    margin-right: 1rem;
    color: #aaa;
  }

  .table td.actions-cell {
    display: flex;
    justify-content: center; /* Changed from flex-end to center */
    padding: 0.75rem 1rem;
  }

  .table td.actions-cell::before {
    display: none;
  }

  .buttons.are-small {
    justify-content: center;
    width: 100%;
  }

  .buttons.are-small .button {
    margin: 0 0.5rem;
  }
}

@media (min-width: 769px) {
  .table-container {
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
  }
}
</style>