<script setup>
import { ref, computed, onMounted } from 'vue';
import * as jwt_decode from 'jwt-decode';
import TeamForm from '../components/forms/TeamForm.vue';

const teams = ref([]);
const leagues = ref([]);
const editingTeam = ref(null);

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

const fetchTeams = async () => {
  try {
    const response = await fetch("https://mevn-project-vjik.onrender.com/api/teams");
    teams.value = await response.json();
  } catch (error) {
    console.error("Error fetching teams:", error);
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

const deleteTeam = async (id) => {
  if (!confirm("This will remove the team from all events. Continue?")) return;

  try {
      const response = await fetch(`https://mevn-project-vjik.onrender.com/api/teams/${id}`, {
      method: "DELETE",
      headers: {
          "Authorization": `Bearer ${localStorage.getItem('token')}`
      }
      });

      const data = await response.json();
      
      if (!response.ok) {
      throw new Error(data.message || "Failed to delete team");
      }

      refreshTeams();
      alert(data.message || "Team deleted successfully");
  } catch (error) {
      console.error("Delete error:", error);
      alert(`Error: ${error.message}`);
  }
};

const getLeagueName = (leagueId) => {
  const league = leagues.value.find(l => l._id === leagueId);
  if (!league) return 'N/A';
  return `${capitalizeWords(league.sport)} ${capitalizeWords(league.ageGroup)}`;
};

const capitalizeWords = (str) => {
  return str?.toLowerCase().replace(/\b\w/g, char => char.toUpperCase()) || '';
};

const openEditModal = (team) => {
  editingTeam.value = team;
};

const handleTeamSaved = () => {
  fetchTeams();
  editingTeam.value = null;
};

const refreshTeams = () => {
  fetchTeams();
  fetchLeagues();
};

onMounted(async () => {
  await Promise.all([fetchTeams(), fetchLeagues()]);
});
</script>

<template>
  <div class="page-container">
    <div class="level">
      <div class="level-left">
        <h1 class="title has-text-light">Teams Management</h1>
      </div>
    </div>

    <div class="box content-box mb-5">
      <TeamForm :is-modal="false" @team-created="refreshTeams" />
    </div>

    <div class="box content-box">
      <div class="table-container">
        <table class="table is-fullwidth is-hoverable left-align">
          <thead>
            <tr>
              <th>School</th>
              <th>Team Name</th>
              <th>League</th>
              <th>Location</th>
              <th v-if="isAdmin">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="team in teams" :key="team._id">
              <td data-label="School">{{ team.school }}</td>
              <td data-label="Team Name">{{ team.name }}</td>
              <td data-label="League">{{ getLeagueName(team.leagueId) }}</td>
              <td data-label="Location" class="right-align">{{ team.location }}</td>
              <td v-if="isAdmin" class="actions-cell">
                <div class="buttons are-small">
                  <button class="button is-info is-outlined" @click="openEditModal(team)">
                    <span class="icon">
                      <i class="fas fa-edit"></i>
                    </span>
                  </button>
                  <button @click="deleteTeam(team._id)" class="button is-danger is-outlined">
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
    <div class="modal" :class="{ 'is-active': editingTeam }">
      <div class="modal-background" @click="editingTeam = null"></div>
      <div class="modal-card">
        <header class="modal-card-head">
          <p class="modal-card-title">Edit Team</p>
          <button class="delete" aria-label="close" @click="editingTeam = null"></button>
        </header>
        <section class="modal-card-body">
          <TeamForm 
            :initial-data="editingTeam" 
            :is-modal="true" 
            @team-created="handleTeamSaved" 
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

.right-align {
  text-align: right;
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

  .table td.right-align {
    justify-content: flex-end; /* Aligns content to right in mobile view */
  }

  .table td.right-align::before {
    margin-right: auto; /* Pushes the label to the left */
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