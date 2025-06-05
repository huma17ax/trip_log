<template>
  <div class="app-container">
    <ion-page>
      <ion-content class="ion-padding">
        <ion-nav ref="ionNavRef" :root="mapView"></ion-nav>
      </ion-content>
    </ion-page>
  </div>
</template>

<script setup lang="ts">
import { ref, markRaw } from 'vue'
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonNav
} from '@ionic/vue'

import MapView from '@/views/MapView.vue'

// Ion-navの参照
const ionNavRef = ref()

const mapView = ref(markRaw(MapView));
</script>

<style scoped>
.app-container {
  height: 100vh;
  display: flex;
  flex-direction: column;
}

ion-content {
  --padding-start: 0;
  --padding-end: 0;
  --padding-top: 0;
  --padding-bottom: 0;
}

ion-nav {
  width: 100%;
  height: 100%;
}
</style>
