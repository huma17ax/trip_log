<template>
  <div id="wishlist">
    <ion-card v-for="item in wish_location" :key="item.id">
      <ion-card-header>
        <div class="card-content">
          <div class="photo-container">
            <!-- <img v-if="item.photos.length > 0" :src="item.photos[0]" alt="訪問地の写真" />
            <ion-thumbnail v-else>
              <ion-icon :icon="locationOutline" size="large"></ion-icon>
            </ion-thumbnail> -->
          </div>
          <div class="text-content">
            <ion-card-title>{{ item.name }}</ion-card-title>
            <ion-card-subtitle>{{ item.address }}</ion-card-subtitle>
          </div>
        </div>
      </ion-card-header>
    </ion-card>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import type { Location } from '@/types';
import { IonCard, IonCardHeader, IonCardSubtitle, IonCardTitle, IonThumbnail, IonIcon } from '@ionic/vue';
import { locationOutline } from 'ionicons/icons';

const wish_location = ref<Location[]>([
  // テストデータ
  {
    id: '1',
    name: '東京タワー',
    address: '東京都千代田区永田町1-7-1',
    latitude: 35.6585805,
    longitude: 139.7454329,
    wish: true
  },
  {
    id: '2',
    name: '東京スカイツリー',
    address: '東京都墨田区押上1-1-2',
    latitude: 35.7100627,
    longitude: 139.8107005,
    wish: true
  }
]);

</script>

<style scoped></style>
