<script setup>
import { ref, onMounted, computed } from 'vue';
import axios from 'axios';
import { useRouter } from 'vue-router';
import EventTable from './EventTable.vue';
import * as jwt_decode from 'jwt-decode';

const router = useRouter();
const secureMessage = ref('');
const userId = ref('');
const userName = ref('');
const showMobileMenu = ref(false);

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
          <a class="navbar-item has-text-weight-bold is-size-5-mobile is-size-4-tablet">
            <router-link to="/dashboard">
              <span class="has-text-primary">ATHLETICS</span>
            </router-link>
          </a>
          
          <!-- Burger menu for mobile -->
          <a role="button" 
             class="navbar-burger" 
             aria-label="menu" 
             aria-expanded="false" 
             data-target="navbarBasic"
             @click="showMobileMenu = !showMobileMenu"
             :class="{ 'is-active': showMobileMenu }">
            <span aria-hidden="true"></span>
            <span aria-hidden="true"></span>
            <span aria-hidden="true"></span>
          </a>
        </div>

        <div id="navbarBasic" class="navbar-menu" :class="{ 'is-active': showMobileMenu }">
          <div class="navbar-end">
            <div class="navbar-item is-hidden-mobile">
              <span class="has-text-weight-semibold is-size-6">
                Welcome, <span class="has-text-info">{{ userName }}</span>
              </span>
            </div>
            
            <div v-if="isAdmin" class="navbar-item has-dropdown is-hoverable">
              <a class="navbar-link is-arrowless">
                <span class="icon">
                  <i class="fas fa-cog"></i>
                </span>
                <span class="is-hidden-mobile">Admin</span>
              </a>
              <div class="navbar-dropdown is-right">
                <router-link to="/dashboard/leagues" class="navbar-item">
                  <span class="icon is-small mr-2">
                    <i class="fas fa-trophy"></i>
                  </span>
                  Leagues
                </router-link>
                <router-link to="/dashboard/events" class="navbar-item">
                  <span class="icon is-small mr-2">
                    <i class="fas fa-calendar-alt"></i>
                  </span>
                  Events
                </router-link>
                <router-link to="/dashboard/teams" class="navbar-item">
                  <span class="icon is-small mr-2">
                    <i class="fas fa-users"></i>
                  </span>
                  Teams
                </router-link>
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
              <button class="button is-info is-outlined is-small-mobile" @click="logout">
                <span class="icon">
                  <i class="fas fa-sign-out-alt"></i>
                </span>
                <span class="is-hidden-mobile">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>

    <!-- Dashboard Content -->
    <section class="section dashboard-content is-fullwidth">
      <router-view v-if="$route.matched.length > 1"></router-view> <!-- Shows nested routes -->
      
      <div v-else class="content-wrapper"> <!-- Default dashboard content -->
        <div class="level">
          <div class="level-item has-text-centered">
            <h1 class="title has-text-light is-size-4-mobile">Dashboard</h1>
          </div>
        </div>
        <EventTable :isAdmin="isAdmin"></EventTable>
      </div>
    </section>
  </div>
</template>

<style scoped>
.dashboard-layout {
  background-color: #121212;
  min-height: 100vh;
  width: 100%;
}

.dashboard-content {
  padding-top: 4rem;
  padding-left: 1rem;
  padding-right: 1rem;
}

.navbar {
  min-height: 3.5rem;
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

/* Mobile-specific styles */
@media screen and (max-width: 768px) {
  .dashboard-content {
    padding-top: 3.5rem;
    padding-left: 0.75rem;
    padding-right: 0.75rem;
  }
  
  .navbar-item .button {
    font-size: 0.875rem;
  }
  
  .navbar-brand .navbar-item {
    padding: 0.5rem 0.75rem;
  }
}
</style>