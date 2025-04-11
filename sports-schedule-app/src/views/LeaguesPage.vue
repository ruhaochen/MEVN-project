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
                <td>{{ capitalizeWords(league.sport) }}</td>
                <td>{{ capitalizeWords(league.season) }}</td>
                <td>{{ capitalizeWords(league.ageGroup) }}</td>
                <td>{{ capitalizeWords(league.division) }}</td>
                <td>{{ league.gender === ' ' ? 'Co-Ed' : capitalizeWords(league.gender) }}</td>
                <td v-if="isAdmin">
                  <button class="button is-small is-info is-outlined" @click="openEditModal(league)">
                    <span class="icon">
                      <i class="fas fa-edit"></i>
                    </span>
                  </button>
                  <button @click="deleteLeague(league._id)" class="button is-danger is-outlined">
                      <span class="icon"><i class="fas fa-trash"></i></span>
                  </button>
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

  .left-align th,
  .left-align td {
    text-align: left;
  }
</style>