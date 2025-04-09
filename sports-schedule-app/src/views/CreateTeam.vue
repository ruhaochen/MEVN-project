<script setup>
import { onMounted, ref } from "vue";

const league = ref("");
const name = ref("");
const school = ref("");
const location = ref("");
const leagues = ref([]);

const props = defineProps({
    showTeamModal:{
        type: Boolean,
        required: true
    }
});

const emit = defineEmits(['close-team-modal']);

const fetchLeagues = async () => {
    try {
        const response = await fetch("http://localhost:3000/api/leagues");
        leagues.value = await response.json();
    } catch (error) {
        console.error("Error fetching leagues:", error);
    }
};

onMounted(async () => {
  try {
    await fetchLeagues();
  } catch (error) {
    console.error("Failed loading initial data:", error);
  }
});

const createTeam = async () => {
    const leagueId = league.value._id; 
    try {
        const response = await fetch("http://localhost:3000/api/teams", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                leagueId: leagueId,
                name: name.value,
                school: school.value,
                location: location.value
            }),
        });
        if (!response.ok) {
            throw new Error("Failed to add team");
        }
        const data = await response.json();
        alert("Team created successfully!");

        league.value = "";
        name.value = "";
        school.value = ""; 
        location.value = "";
    
    } catch (error) {
        console.error("Error adding team:", error);
    }
};

const capitalizeWords = (str) => {
  return str.toLowerCase().replace(/\b\w/g, char => char.toUpperCase());
}

const closeModal = () => {
    emit('close-team-modal')
};

</script>

<template>
    <div>
        <!-- Modal overlay -->
        <div v-if="showTeamModal" class="modal is-active">
            <div class="modal-background" @click="closeModal"></div>
            <div class="modal-card">
                <header class="modal-card-head">
                    <p class="modal-card-title">Create New Team</p>
                    <button class="delete" aria-label="close" @click="closeModal"></button>
                </header>
                <section class="modal-card-body">
                    <form @submit.prevent="createTeam">
                        <div class="columns is-multiline">
                            
                            <!-- League -->
                            <div class="column is-full">
                                <div class="field">
                                    <label class="label">League</label>
                                    <div class="control">
                                        <div class="select is-fullwidth">
                                            <select v-model="league" required :class="{'placeholder': !league}">
                                                <option value="" disabled hidden>Select League</option>
                                                <option v-for="league in leagues" :key="league._id" :value="league">
                                                    {{ capitalizeWords(league.sport + " " + league.ageGroup + " " + league.division + " " + league.gender) }}
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

                            <!-- Location (simplified for future Google Maps integration) -->
                            <div class="column is-full">
                                <div class="field">
                                    <label class="label">Location</label>
                                    <div class="control">
                                        <input
                                            v-model="location"
                                            class="input"
                                            type="text"
                                            placeholder="Enter address or location"
                                            required
                                        />
                                    </div>
                                    <p class="help">You'll be able to select from Google Maps in the future</p>
                                </div>
                            </div>
                        </div>

                        <!-- Submit Button -->
                        <div class="field">
                            <div class="control">
                                <button type="submit" class="button is-primary">Add Team</button>
                            </div>
                        </div>
                    </form>
                </section>
            </div>
        </div>
    </div>
</template>

<style>
select.placeholder {
    color: #54565A;
}

.field:not(:last-child) {
    margin-bottom: 0.75rem;
}

.button.is-primary {
    background-color: #485fc7;
    border-color: transparent;
    color: #fff;
    width: 100%;
    margin-top: 1rem;
}

/* DELETE LATER */
.help {
    font-size: 0.75rem;
    margin-top: 0.25rem;
    color: #666;
}
</style>