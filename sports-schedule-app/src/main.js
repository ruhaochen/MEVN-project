import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import VueGoogleMaps from '@fawmi/vue-google-maps'
import axios from 'axios';
import "bulma/css/bulma.min.css";
import '@fortawesome/fontawesome-free/css/all.min.css'
import router from './router';

const app = createApp(App);

// app.use(VueGoogleMaps, {
//     load: {
//       key: process.env.VUE_APP_GOOGLE_MAPS_API_KEY,
//     },
// });

// app.mount('#app');

axios.defaults.baseURL = 'https://mevn-project-vjik.onrender.com';

axios.get('/api/maps-key')
  .then(res => {
    const key = res.data.key;
    if (!key) throw new Error('API key missing from response');

    app.use(router);
    app.use(VueGoogleMaps, {
      load: {
        key,
      },
    });

    app.mount('#app');
    })
  .catch(err => {
    console.error('Error loading Google Maps API key:', err);
});

// app.use(router);
// app.mount('#app');