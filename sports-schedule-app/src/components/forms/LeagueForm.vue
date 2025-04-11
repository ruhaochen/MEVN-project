<script setup>
import { ref, watchEffect } from 'vue';
import { useToast } from '../../composables/useToast';

const { showToast } = useToast();

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

const emit = defineEmits(['league-created']);

const sport = ref("");
const season = ref(""); 
const ageGroup = ref("");
const gender = ref("");
const division = ref("");
const isLoading = ref(false);
const errorMessage = ref("");

// Initialize form for edit mode
watchEffect(() => {
  if (props.initialData) {
    sport.value = props.initialData.sport;
    season.value = props.initialData.season;
    ageGroup.value = props.initialData.ageGroup;
    gender.value = props.initialData.gender;
    division.value = props.initialData.division;
  }
});

const saveLeague = async () => {
  isLoading.value = true;
  errorMessage.value = "";

  try {
    const method = props.initialData ? "PUT" : "POST";
    const url = props.initialData 
      ? `https://mevn-project-vjik.onrender.com/api/leagues/${props.initialData._id}`
      : "https://mevn-project-vjik.onrender.com/api/leagues";

    const response = await fetch(url, {
      method,
      headers: { 
        "Content-Type": "application/json",
        "Authorization": `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({
        season: season.value.toLowerCase(),
        sport: sport.value.toLowerCase(),
        ageGroup: ageGroup.value.toLowerCase(),
        division: division.value.toLowerCase(),
        gender: gender.value.toLowerCase()
      }),
    });

    const data = await response.json();

    if (!response.ok) throw new Error("Failed to save league");
    
    showToast("League saved successfully!");
    emit('league-created');
    
    if (!props.isModal) {
      sport.value = "";
      season.value = "";
      ageGroup.value = "";
      division.value = "";
      gender.value = "";
    }
  } catch (error) {
    console.error("Error saving league:", error);
    showToast("Failed to save league", "danger"); 
    // alert("Failed to save league");
    errorMessage.value = error.message;
  } finally {
    isLoading.value = false;
  }
};

const capitalizeWords = (str) => {
  return str?.toLowerCase().replace(/\b\w/g, char => char.toUpperCase()) || '';
};
</script>

<template>
  <form @submit.prevent="saveLeague">
    <div v-if="errorMessage" class="notification is-danger is-light">
      {{ errorMessage }}
    </div>
    <div class="columns is-multiline">
      <!-- Season -->
      <div class="column is-full">
        <div class="field">
          <label class="label">Season</label>
          <div class="control">
            <div class="select is-fullwidth">
              <select v-model="season" required :class="{'placeholder': !season}">
                <option value="" disabled hidden>Select Season</option>
                <option value="fall">Fall</option>
                <option value="winter">Winter</option>
                <option value="spring">Spring</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <!-- Sport -->
      <div class="column is-half">
        <div class="field">
          <label class="label">Sport</label>
          <div class="control">
            <input 
              v-model="sport" 
              class="input" 
              type="text" 
              placeholder="e.g., Basketball" 
              required
            />
          </div>
        </div>
      </div>

      <!-- Age Group -->
      <div class="column is-half">
        <div class="field">
          <label class="label">Age Group</label>
          <div class="control">
            <input 
              v-model="ageGroup" 
              class="input" 
              type="text" 
              placeholder="e.g., U17 or Senior" 
              required
            />
          </div>
        </div>
      </div>

      <!-- Division -->
      <div class="column is-half">
        <div class="field">
          <label class="label">Division</label>
          <div class="control">
            <input 
              v-model="division" 
              class="input" 
              type="text" 
              placeholder="e.g., D1 or Varsity" 
              required
            />
          </div>
        </div>
      </div>

      <!-- Gender -->
      <div class="column is-half">
        <div class="field">
          <label class="label">Gender</label>
          <div class="control">
            <div class="select is-fullwidth">
              <select v-model="gender" required :class="{'placeholder': !gender}">
                <option value="" disabled hidden>Select Gender</option>
                <option value="girls">Girls</option>
                <option value="boys">Boys</option>
                <option value=" ">Co-Ed</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="field">
      <div class="control">
        <button 
          type="submit" 
          class="button is-primary is-fullwidth"
          :class="{ 'is-loading': isLoading }"
          :disabled="isLoading"
        >
          {{ initialData ? 'Update League' : 'Create League' }}
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