<template>
    <div id="map"></div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { Loader } from '@googlemaps/js-api-loader';

const initMap = async () => {
    const loader = new Loader({
        apiKey: 'AIzaSyAJnGmiq0cX3KpeDGUXk9DD_-MQJ1EKH84',
        version: 'weekly',
    });
    
    try {
        const { Map } = await loader.importLibrary('maps');
        const map = new Map(document.getElementById('map') as HTMLElement, {
            center: { lat: 35.6812, lng: 139.7671 }, // 東京の座標
            zoom: 12,
        });
    } catch (error) {
        console.error('Google Mapsの読み込みに失敗しました:', error);
    }
};

onMounted(() => {
    initMap();
});
</script>

<style scoped>
#map {
    width: 100%;
    height: 100vh;
}
</style>
