<script setup>
import { ref } from 'vue';

const sport = ref("");
const season = ref(""); 
const ageGroup = ref("");
const gender = ref("");
const division = ref("");

const props = defineProps({
    showLeagueModal:{
        type: Boolean,
        required: true
    }
});

const emit = defineEmits(['close-league-modal']);

const createLeague = async () => {
    try {
        const response = await fetch("http://localhost:3000/api/leagues", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                season: season.value.toLowerCase(),
                sport: sport.value.toLowerCase(),
                ageGroup: ageGroup.value.toLowerCase(),
                division: division.value.toLowerCase(),
                gender: gender.value.toLowerCase()
            }),
        });
        if (!response.ok) {
            throw new Error("Failed to add league");
        }
        const data = await response.json();
        alert("League created successfully!");

        season.value = "";
        sport.value = "";
        ageGroup.value = "";
        division.value = ""; 
        gender.value = "";
        
        closeModal();
        emit('')
    } catch (error) {
        console.error("Error adding league:", error);
    }
};

const closeModal = () => {
    emit('close-league-modal')
}; 
</script> 

<template>
    <div>
        <!-- Modal overlay -->
        <div v-if="showLeagueModal" class="modal is-active">
            <div class="modal-background" @click="closeModal"></div>
            <div class="modal-card">
                <header class="modal-card-head">
                    <p class="modal-card-title">Create New League</p>
                    <button class="delete" aria-label="close" @click="closeModal"></button>
                </header>
                <section class="modal-card-body">
                    <form @submit.prevent="createLeague">
                        <div class="columns is-multiline">

                            <!-- Season -->
                            <div class="column is-full">
                                <div class="field">
                                    <label class="label">Season</label>
                                    <div class="control">
                                        <div class="select is-fullwidth">
                                            <select v-model="season" required :class="{'placeholder': !season}">
                                                <option value="" disabled hidden>Season</option>
                                                <option value='fall'>Fall</option>
                                                <option value='winter'>Winter</option>
                                                <option value='spring'>Spring</option>
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
                                                <option value="" disabled hidden>Boys/Girls/Co-Ed</option>
                                                <option value='girls'>Girls</option>
                                                <option value='boys'>Boys</option>
                                                <option value=" ">Co-Ed</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Submit Button -->
                        <div class="field">
                            <div class="control">
                                <button type="submit" class="button is-primary">Add League</button>
                            </div>
                        </div>
                    </form>
                </section>
            </div>
        </div>
    </div>
</template>

<style scoped>
select.placeholder {
    color: #54565A;
}
</style>
