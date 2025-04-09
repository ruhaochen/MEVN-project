<script setup>
import { ref, watch, onMounted, watchEffect } from "vue";

const props = defineProps({
  initialData: {
    type: Object,
    default: null
  },
  isModal: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['event-created']);

const type = ref("");
const league = ref("");
const location = ref("");
const date = ref("");
const time = ref("");
const opposingTeam = ref("");
const notes = ref("");
const leagues = ref([]);
const teams = ref([]);

// Initialize form for edit mode
// watchEffect(() => {
//   if (props.initialData) {
//     type.value = props.initialData.type;
//     league.value = leagues.value.find(l => l._id === props.initialData.leagueId);
//     location.value = props.initialData.location;
//     date.value = props.initialData.date.split('T')[0];
//     time.value = props.initialData.time;
//     opposingTeam.value = teams.value.find(t => t._id === props.initialData.opposingTeamId);
//     notes.value = props.initialData.notes;
//   }
// });

watchEffect(() => {
  if (props.initialData) {
    type.value = props.initialData.type;
    date.value = props.initialData.date.split('T')[0];
    time.value = props.initialData.time;
    notes.value = props.initialData.notes || "";
    // Set after data loaded
    if (leagues.value.length) {
      league.value = leagues.value.find(l => l._id === props.initialData.leagueId);
    }
    if (teams.value.length && props.initialData.opposingTeamId) {
      opposingTeam.value = teams.value.find(t => t._id === props.initialData.opposingTeamId);
    }
  }
});

const fetchLeagues = async () => {
  try {
    const response = await fetch("https://mevn-project-vjik.onrender.com/api/leagues");
    leagues.value = await response.json();

    if (props.initialData?.leagueId) {
      league.value = leagues.value.find(l => l._id === props.initialData.leagueId);
    }
  } catch (error) {
    console.error("Error fetching leagues:", error);
  }
};

const fetchTeams = async () => {
  if (!league.value?._id) return;
  try {
    const response = await fetch(`https://mevn-project-vjik.onrender.com/api/leagues/${league.value._id}/teams`);
    teams.value = await response.json();
    
    if (props.initialData?.opposingTeamId) {
      opposingTeam.value = teams.value.find(t => t._id === props.initialData.opposingTeamId);
    }
  } catch (error) {
    console.error("Error fetching teams:", error);
  }
};

// watch(league, () => {
//   opposingTeam.value = "";
//   fetchTeams();
// });

watch(league, (newLeague) => {
  if (newLeague?._id) fetchTeams(newLeague._id);
});

const saveEvent = async () => {
  try {
    const method = props.initialData ? "PUT" : "POST";
    const url = props.initialData 
      ? `https://mevn-project-vjik.onrender.com/api/events/${props.initialData._id}`
      : "https://mevn-project-vjik.onrender.com/api/events";


      console.log("Payload being sent:", {
      type: type.value,
      leagueId: league.value?._id,
      location: location.value,
      date: date.value,
      time: time.value,
      opposingTeam: opposingTeam.value?.school || "Bayview Glen",
      opposingTeamId: opposingTeam.value?._id ?? null,
      notes: notes.value
    });
    console.log("...")
    console.log("leagueId", league.value?._id);
    console.log("opposingTeamId", opposingTeam.value?._id);

    const payload = {
      type: type.value,
      leagueId: league.value?._id,
      location: location.value,
      date: date.value,
      time: time.value,
      opposingTeam: opposingTeam.value?.school || "Bayview Glen",
      notes: notes.value
    };

    if (opposingTeam.value?._id) {
      payload.opposingTeamId = opposingTeam.value._id;
    }

    const response = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    // const response = await fetch(url, {
    //   method,
    //   headers: { "Content-Type": "application/json" },
    //   body: JSON.stringify({
    //     type: type.value,
    //     leagueId: league.value?._id,
    //     location: location.value,
    //     date: date.value,
    //     time: time.value,
    //     opposingTeam: opposingTeam.value?.school || "Bayview Glen",
    //     opposingTeamId: opposingTeam.value?._id ?? null,
    //     notes: notes.value
    //   }),
    // });

    if (!response.ok) throw new Error("Failed to save event");
    
    alert("Event saved successfully!");
    emit('event-created');
    
    if (!props.isModal) {
      // Reset form if in page mode
      type.value = "";
      league.value = "";
      location.value = "";
      date.value = "";
      time.value = "";
      opposingTeam.value = "";
      notes.value = "";
    }
  } catch (error) {
    console.error("Error saving event:", error);
    alert("Failed to save event");
  }
};

const capitalizeWords = (str) => {
  return str?.toLowerCase().replace(/\b\w/g, char => char.toUpperCase()) || '';
};

onMounted(async () => {
  await fetchLeagues();
  if (props.initialData) {
    await fetchTeams();
  }
});
</script>

<template>
  <form @submit.prevent="saveEvent">
    <div class="columns is-multiline">
      <!-- Event Type -->
      <div class="column is-half">
        <div class="field">
          <label class="label">Event Type</label>
          <div class="control">
            <div class="select is-fullwidth">
              <select v-model="type" required :class="{'placeholder': !type}">
                <option value="" disabled hidden>Select Event</option>
                <option value="game">Game</option>
                <option value="practice">Practice</option>
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
                <option v-for="l in leagues" :key="l._id" :value="l">
                  {{ capitalizeWords(l.sport + " " + l.ageGroup + " " + l.division + " " + l.gender) }}
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
                <option v-if="opposingTeam?.school" :value="`${opposingTeam.school}-gym`">
                  {{ opposingTeam.school }} Gym
                </option>
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

    <div class="field">
      <div class="control">
        <button type="submit" class="button is-primary is-fullwidth">
          {{ initialData ? 'Update Event' : 'Create Event' }}
        </button>
      </div>
    </div>
  </form>
</template>

<style scoped>
select.placeholder {
  color: #54565A;
}
</style>