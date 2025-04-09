<script setup>
import { ref, onMounted, computed } from 'vue';
import axios from 'axios';
import { useRouter } from 'vue-router';
import CreateEvent from "../views/CreateEvent.vue";
import CreateTeam from '../views/CreateTeam.vue';
import CreateLeague from '../views/CreateLeague.vue';
import EventTable from './EventTable.vue';
import * as jwt_decode from 'jwt-decode';

const router = useRouter();
const secureMessage = ref('');
const userId = ref('');
const userName = ref('');

// Admin Check
const isAdmin = computed(() => {
  const token = localStorage.getItem('token');
  if (!token) return false;
  
  try {
    const decoded = jwt_decode.jwtDecode(token);
    return decoded.isAdmin === true;
  } catch (err) {
    console.error('Token decode error:', err);
    return false;
  }
});

const logout = () => {
  localStorage.removeItem('token');
  router.push('/login');
};

onMounted(async () => {
  const token = localStorage.getItem('token');
  try {
    const response = await axios.get('/api/dashboard-data', {
      headers: { Authorization: `Bearer ${token}` }
    });
    secureMessage.value = response.data.message;
    userId.value = response.data.userId;
    userName.value = response.data.userName;
  } catch (err) {
    alert('Session expired or token invalid.');
    logout();
  }
});

const refreshPage = () => {
  location.reload();
};

const showEventModal = ref(false);
const openEventModal = () => {
  showEventModal.value = true;
};
const closeEventModal = () => {
  showEventModal.value = false;
  refreshPage();
};
const showTeamModal = ref(false);
const openTeamModal = () => {
  showTeamModal.value = true;
};
const closeTeamModal = () => {
  showTeamModal.value = false;
  refreshPage();
};
const showLeagueModal = ref(false);
const openLeagueModal = () => {
  showLeagueModal.value = true;
};
const closeLeagueModal = () => {
  showLeagueModal.value = false;
  refreshPage();
};
</script>

<template>
  <div class="dashboard-layout">
    <!-- Navbar -->
    <nav class="navbar is-dark is-fixed-top has-shadow" role="navigation" aria-label="main navigation">
      <div class="container is-fluid">
        <div class="navbar-brand">
          <a class="navbar-item has-text-weight-bold is-size-4">
            <span class="has-text-primary">ATHLETICS</span>
          </a>
        </div>

        <div class="navbar-menu is-active">
          <div class="navbar-end">
            <div class="navbar-item">
              <span class="has-text-weight-semibold is-size-6">
                Welcome, <span class="has-text-info">{{ userName }}</span>
              </span>
            </div>
            
            <div v-if="isAdmin" class="navbar-item has-dropdown is-hoverable">
              <a class="navbar-link is-arrowless">
                <span class="icon">
                  <i class="fas fa-cog"></i>
                </span>
              </a>
              <div class="navbar-dropdown is-right">
                <a class="navbar-item" @click="openLeagueModal">
                  <CreateLeague :showLeagueModal="showLeagueModal" @close-league-modal="closeLeagueModal"></CreateLeague>
                  <span class="icon is-small mr-2">
                    <i class="fas fa-trophy"></i>
                  </span>
                  Leagues
                </a>
                <a class="navbar-item" @click="openEventModal">
                  <CreateEvent :showEventModal="showEventModal" @close-event-modal="closeEventModal"></CreateEvent>
                  <span class="icon is-small mr-2">
                    <i class="fas fa-calendar-alt"></i>
                  </span>
                  Events
                </a>
                <a class="navbar-item" @click="openTeamModal">
                  <CreateTeam :showTeamModal="showTeamModal" @close-team-modal="closeTeamModal"></CreateTeam>
                  <span class="icon is-small mr-2">
                    <i class="fas fa-users"></i>
                  </span>
                  Teams
                </a>
                <hr class="navbar-divider">
                <a class="navbar-item" @click="logout">
                  <span class="icon is-small mr-2">
                    <i class="fas fa-sign-out-alt"></i>
                  </span>
                  Logout
                </a>
              </div>
            </div>
            <div v-else class="navbar-item">
              <button class="button is-info is-outlined" @click="logout">
                <span class="icon">
                  <i class="fas fa-sign-out-alt"></i>
                </span>
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>

    <!-- Dashboard Content -->
    <section class="section dashboard-content is-fullwidth">
      <div class = "content-wrapper">
        <div class="level">
          <div class="level-item has-text-centered">
            <h1 class="title has-text-light">Dashboard</h1>
          </div>
        </div>

        <!-- Event Table -->
        <EventTable :isAdmin="isAdmin"></EventTable>

      </div>
    </section>
  </div>
</template>

<style scoped>
.dashboard-layout {
  background-color: #121212;
  min-height: 100vh;
  width: 100vw; 
  margin: 0;     
  padding: 0;    
}

.dashboard-layout{
  width: 100%
}

.dashboard-content {
  padding-top: 5rem;
}

.navbar {
  min-height: 4rem;
}

.navbar-item img {
  max-height: 2.5rem;
}

.navbar-dropdown {
  border-top: 2px solid #3273dc;
}

.navbar-link:not(.is-arrowless)::after {
  border-color: #3273dc;
}

.dashboard-content {
  padding-top: 5rem;
  padding-left: 1.5rem;
  padding-right: 1.5rem;
  width: 100%;
}

.content-wrapper {
  max-width: 100%;
  width: 100%;
}
</style>