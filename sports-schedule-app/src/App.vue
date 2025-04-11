<script setup>

</script>

<template>
    <div>
        <router-view></router-view>
    </div>
</template>

<style>
.toast-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  pointer-events: none;
  z-index: 9999;
}

.custom-toast {
  padding: 1rem 1.5rem;
  border-radius: 4px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  background: #48c774; /* Bulma success color */
  color: white;
  opacity: 1;
  transition: opacity 0.5s ease-out;
  max-width: 90%;
  text-align: center;
}

.custom-toast.is-danger {
  background: #f14668; /* Bulma danger color */
}

.custom-toast.fade-out {
  opacity: 0 !important;
}

/* Optional: Add some animation */
@keyframes toast-in {
  from { transform: translateY(20px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}

.custom-toast {
  animation: toast-in 0.3s ease-out;
}
</style>