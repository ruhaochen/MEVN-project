<script setup>
import { ref } from 'vue';
import axios from 'axios';
import { useRouter } from 'vue-router';

const username = ref('');
const password = ref('');
const router = useRouter();
const isLoading = ref(false);
const errorMessage = ref('');

const login = async () => {
  try {
    isLoading.value = true;
    errorMessage.value = '';
    const response = await axios.post('/api/login', {
      username: username.value,
      password: password.value,
      isAdmin: true
    });
    localStorage.setItem('token', response.data.token);
    router.push('/dashboard');
  } catch (err) {
    errorMessage.value = 'Invalid username or password';
  } finally {
    isLoading.value = false;
  }
};

const continueAsGuest = async () => {
  try {
    isLoading.value = true;
    const response = await axios.post('/api/guest');
    localStorage.setItem('token', response.data.token);
    router.push('/dashboard');
  } catch (err) {
    errorMessage.value = 'Could not continue as guest';
  } finally {
    isLoading.value = false;
  }
};
</script>

<template>
  <div class="section" style="min-height: 100vh; display: flex; align-items: center;">
    <div class="container" style="max-width: 500px;">
      <div class="box p-6">
        <h2 class="title has-text-centered mb-5">Login</h2>
        
        <form @submit.prevent="login">
          <div class="field mb-5">
            <label class="label">Username</label>
            <div class="control has-icons-left">
              <input 
                v-model="username" 
                class="input is-medium" 
                type="text" 
                placeholder="Username" 
                required
              />
              <span class="icon is-medium is-left">
                <i class="fas fa-user"></i>
              </span>
            </div>
          </div>
          
          <div class="field mb-5">
            <label class="label">Password</label>
            <div class="control has-icons-left">
              <input 
                v-model="password" 
                class="input is-medium" 
                type="password" 
                placeholder="Password" 
                required
              />
              <span class="icon is-medium is-left">
                <i class="fas fa-lock"></i>
              </span>
            </div>
          </div>
          
          <div v-if="errorMessage" class="notification is-danger is-light mb-5">
            {{ errorMessage }}
          </div>
          
          <div class="field">
            <div class="control">
              <button 
                type="submit" 
                class="button is-primary is-medium is-fullwidth"
                :class="{ 'is-loading': isLoading }"
              >
                Login
              </button>
              <button 
                type="button" 
                class="button is-light is-medium is-fullwidth mt-3"
                @click="continueAsGuest"
                :class="{ 'is-loading': isLoading }"
              >
                Continue as Guest
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>