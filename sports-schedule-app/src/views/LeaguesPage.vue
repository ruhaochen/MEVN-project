<script setup>
import { ref, computed, onMounted } from 'vue';
import * as jwt_decode from 'jwt-decode';
import LeagueForm from '../components/forms/LeagueForm.vue';

const leagues = ref([]);
const editingLeague = ref(null);

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

const fetchLeagues = async () => {
  try {
    const response = await fetch("https://mevn-project-vjik.onrender.com/api/leagues");
    leagues.value = await response.json();
  } catch (error) {
    console.error("Error fetching leagues:", error);
  }
};

const deleteLeague = async (id) => {
  if (!confirm("WARNING: This will permanently delete the league and ALL associated teams and events!")) return;

  try {
      const response = await fetch(`https://mevn-project-vjik.onrender.com/api/leagues/${id}`, {
      method: "DELETE",
      headers: {
          "Authorization": `Bearer ${localStorage.getItem('token')}`
      }
      });

      const data = await response.json();
      
      if (!response.ok) {
      throw new Error(data.message || "Failed to delete league");
      }

      refreshLeagues();
      alert(data.message || "League deleted successfully");
  } catch (error) {
      console.error("Delete error:", error);
      alert(`Error: ${error.message}`);
  }
};

const capitalizeWords = (str) => {
  return str?.toLowerCase().replace(/\b\w/g, char => char.toUpperCase()) || '';
};

const openEditModal = (league) => {
  editingLeague.value = league;
};

const handleLeagueSaved = () => {
  fetchLeagues();
  editingLeague.value = null;
};

const refreshLeagues = () => {
  fetchLeagues();
};

onMounted(fetchLeagues);
</script>

<template>
  <div class="page-container">
    <div class="level">
      <div class="level-left">
        <h1 class="title has-text-light">Leagues Management</h1>
      </div>
    </div>

    <div class="box content-box mb-5">
      <LeagueForm :is-modal="false" @league-created="refreshLeagues" />
    </div>

    <div class="box content-box">
      <div class="table-container">
        <table class="table is-fullwidth is-hoverable left-align">
          <thead>
            <tr>
              <th>Sport</th>
              <th>Season</th>
              <th>Age Group</th>
              <th>Division</th>
              <th>Gender</th>
              <th v-if="isAdmin">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="league in leagues" :key="league._id">
              <td data-label="Sport">{{ capitalizeWords(league.sport) }}</td>
              <td data-label="Season">{{ capitalizeWords(league.season) }}</td>
              <td data-label="Age Group">{{ capitalizeWords(league.ageGroup) }}</td>
              <td data-label="Division">{{ capitalizeWords(league.division) }}</td>
              <td data-label="Gender">{{ league.gender === ' ' ? 'Co-Ed' : capitalizeWords(league.gender) }}</td>
              <td v-if="isAdmin" class="actions-cell">
                <div class="buttons are-small">
                  <button class="button is-info is-outlined" @click="openEditModal(league)">
                    <span class="icon">
                      <i class="fas fa-edit"></i>
                    </span>
                  </button>
                  <button @click="deleteLeague(league._id)" class="button is-danger is-outlined">
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
    <div class="modal" :class="{ 'is-active': editingLeague }">
      <div class="modal-background" @click="editingLeague = null"></div>
      <div class="modal-card">
        <header class="modal-card-head">
          <p class="modal-card-title">Edit League</p>
          <button class="delete" aria-label="close" @click="editingLeague = null"></button>
        </header>
        <section class="modal-card-body">
          <LeagueForm 
            :initial-data="editingLeague" 
            :is-modal="true" 
            @league-created="handleLeagueSaved" 
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
    margin-bottom: 1.5rem;
    border-bottom: 2px solid #444;
    background-color: #2a2a2a;
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
    padding: 0.5rem 0;
  }

  .table td {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.75rem 1rem;
    border: none;
    border-bottom: 1px solid #333;
  }

  .table td::before {
    content: attr(data-label);
    font-weight: bold;
    margin-right: 1rem;
    color: #aaa;
  }

  .table td.actions-cell {
    display: flex;
    justify-content: center;
    padding: 0.75rem 1rem;
    border-bottom: none;
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