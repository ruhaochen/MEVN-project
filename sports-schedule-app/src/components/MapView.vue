<script setup>


async function getCoordinates(address) {
  const response = await fetch(`/api/geocode?address=${encodeURIComponent(address)}`);
  const data = await response.json();
  console.log(data);
}

const res = await fetch(`/api/geocode?address=1600+Amphitheatre+Parkway,+Mountain+View,+CA`);
const { lat, lng } = await res.json();
</script>

<template>
    <GMapMap
      :center="{ lat: 43.6532, lng: -79.3832 }"
      :zoom="10"
      style="width: 100%; height: 500px"
    >
      <GMapMarker :position="{ lat: 43.6532, lng: -79.3832 }" />
    </GMapMap>
</template>
