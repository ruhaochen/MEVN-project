<script setup>
import { onMounted, watch, ref } from "vue";

const type = ref("");
const league = ref("");
const location = ref("");
const date = ref("");
const time = ref("");
const opposingTeam = ref("");
const notes = ref("");
const leagues = ref([]);
const teams = ref([]);

const props = defineProps({
    showEventModal:{
        type: Boolean,
        required: true
    }
});

const emit = defineEmits(['close-event-modal']);

const fetchLeagues = async () => {
    try {
        const response = await fetch("https://mevn-project-vjik.onrender.com/api/leagues");
        leagues.value = await response.json();
    } catch (error) {
        console.error("Error fetching leagues:", error);
    }
};

const fetchTeams = async () => {
    const link = "https://mevn-project-vjik.onrender.com/api/leagues/" + league.value._id + "/teams";
    try {
        const response = await fetch(link);
        teams.value = await response.json();
    } catch (error) {
        console.error("Error fetching teams:", error);
    }
};

watch(league, (newLeague) => {
  if (newLeague && newLeague._id) {
    opposingTeam.value = "";
    fetchTeams();
  }
});

onMounted(async () => {
  try {
    //await Promise.all([fetchTeams(), fetchLeagues()]);
    await fetchLeagues();
  } catch (error) {
    console.error("Failed loading initial data:", error);
  }
});

const capitalizeWords = (str) => {
  return str.toLowerCase().replace(/\b\w/g, char => char.toUpperCase());
}

const createEvent = async () => {
    const opposingTeamId = opposingTeam.value._id;
    const leagueId = league.value._id;
    try {
        const response = await fetch("https://mevn-project-vjik.onrender.com/api/events", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                type: type.value,
                leagueId: leagueId,
                location: location.value,
                date: date.value,
                time: time.value,
                opposingTeam: opposingTeam.value.school,
                opposingTeamId: opposingTeamId,
                notes: notes.value,
            }),
        });
        if (!response.ok) {
            throw new Error("Failed to add event");
        }

        const data = await response.json();
        alert("Event added successfully!");

        type.value = "";
        league.value = "";
        location.value = "";
        date.value = "";
        time.value = "";
        opposingTeam.value = "";
        notes.value = "";
        
    } catch (error) {
        console.error("Error adding event:", error);
    }
};

// const openModal = () => {
//     showModal.value = true;
//     emit('open-modal')
// };

const closeModal = () => {
    emit('close-event-modal')
};
</script>

<template>
    <div>
        <!-- Modal overlay -->
        <div v-if="showEventModal" class="modal is-active">
            <div class="modal-background" @click="closeModal"></div>
            <div class="modal-card">
                <header class="modal-card-head">
                    <p class="modal-card-title">Create New Event</p>
                    <button class="delete" aria-label="close" @click="closeModal"></button>
                </header>
                <section class="modal-card-body">
                    <form @submit.prevent="createEvent">
                        <div class="columns is-multiline">
                            
                            <!-- Event Type -->
                            <div class="column is-half">
                                <div class="field">
                                    <label class="label">Event Type</label>
                                    <div class="control">
                                        <div class="select is-fullwidth">
                                            <select v-model="type" id="event-type" required :class="{'placeholder': !type}">
                                                <option value="" disabled hidden>Select Event</option>
                                                <option value='game'>Game</option>
                                                <option value='practice'>Practice</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <!-- League -->
                            <div class="column is-half">
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

                            <!-- Opposing Team -->
                            <div class="column is-half">
                                <div class="field">
                                    <label class="label">Opposing Team</label>
                                    <div class="control">
                                        <div class="select is-fullwidth">
                                            <select v-if="type === 'practice'" v-model="opposingTeam" :class="{'placeholder': !opposingTeam}">
                                                <option value="">Bayview Glen</option>
                                            </select>
                                            <select v-else v-model="opposingTeam" required :class="{'placeholder': !opposingTeam}">
                                                <option value="" disabled hidden>Select Opposing Team</option>
                                                <option v-for="team in teams" :key="team._id" :value="team">
                                                    {{ team.school + " " + team.name }}
                                                </option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <!-- Location -->
                            <div class="column is-half">
                                <div class="field">
                                    <label class="label">Location</label>
                                    <div class="control">
                                        <div class="select is-fullwidth">
                                            <select v-if="type === 'game'" v-model="location" required :class="{'placeholder': !location}">
                                                <option value="" disabled hidden>Select Location</option>
                                                <option value="us-gym">Upper School Gym</option>
                                                <option value="prep-gym">Prep School Gym</option>
                                                <option value="opposing-gym">{{ opposingTeam.school }} Gym</option>
                                            </select>
                                            <select v-else v-model="location" required :class="{'placeholder': !location}">
                                                <option value="" disabled hidden>Select Location</option>
                                                <option value="us-gym">Upper School Gym</option>
                                                <option value="prep-gym">Prep School Gym</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <!-- Date -->
                            <div class="column is-half">
                                <div class="field">
                                    <label class="label">Date</label>
                                    <div class="control">
                                        <input v-model="date" class="input" type="date" required />
                                    </div>
                                </div>
                            </div>

                            <!-- Time -->
                            <div class="column is-half">
                                <div class="field">
                                    <label class="label">Time</label>
                                    <div class="control">
                                        <input v-model="time" class="input" type="time" required />
                                    </div>
                                </div>
                            </div>

                            <!-- Notes -->
                            <div class="column is-full">
                                <div class="field">
                                    <label class="label">Notes</label>
                                    <div class="control">
                                        <textarea v-model="notes" class="textarea" placeholder="Notes"></textarea>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Submit Button -->
                        <div class="field">
                            <div class="control">
                                <button type="submit" class="button is-primary">Add Event</button>
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
</style>