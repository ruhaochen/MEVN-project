<script setup>
import { ref, computed, onMounted } from 'vue';
import * as jwt_decode from 'jwt-decode';
import EventForm from '../components/forms/EventForm.vue';

const events = ref([]);
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
};

onMounted(fetchEvents);
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
          <table class="table is-fullwidth is-hoverable">
            <thead>
              <tr>
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
                <td>{{ formatDate(event.date) }}</td>
                <td>{{ formatTime(event.time) }}</td>
                <td>{{ capitalizeWords(event.type) }}</td>
                <td>{{ event.opposingTeam || 'Bayview Glen' }}</td>
                <td>{{ getLocationName(event.location) }}</td>
                <td>{{ event.notes || '-' }}</td>
                <td v-if="isAdmin">
                  <button class="button is-small is-info is-outlined" @click="openEditModal(event)">
                    <span class="icon">
                      <i class="fas fa-edit"></i>
                    </span>
                  </button>
                  <button @click="deleteEvent(event._id)" class="button is-danger is-outlined">
                      <span class="icon"><i class="fas fa-trash"></i></span>
                  </button>
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
    padding: 1.5rem;
    background-color: #121212;
    min-height: 100vh;
  }
  
  .content-box {
    background-color: #1e1e1e;
    border: 1px solid #333;
    border-radius: 6px;
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
    width: 80%;
    max-width: 800px;
  }

  .buttons.are-small .button {
  margin-right: 0.25rem;
  }
</style>