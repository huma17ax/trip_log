<template>
  <ion-header>
    <ion-toolbar>
      <ion-buttons slot="start">
        <ion-back-button @click="goBack" text=""></ion-back-button>
      </ion-buttons>
      <ion-title>ウィッシュリスト</ion-title>
    </ion-toolbar>
  </ion-header>

  <ion-content class="ion-padding">
    <div id="wishlist">
      <ion-card v-for="item in wish_location" :key="item.id">
        <ion-card-header>
          <div class="card-content">
            <div class="photo-container">
              <!-- <img v-if="item.photos.length > 0" :src="item.photos[0]" alt="訪問地の写真" />
                <ion-thumbnail v-else>
                  <ion-icon :icon="locationOutline" size="large"></ion-icon>
                </ion-thumbnail> -->
              <ion-thumbnail>
                <ion-icon :icon="heartOutline" size="large"></ion-icon>
              </ion-thumbnail>
            </div>
            <div class="text-content">
              <ion-card-title>{{ item.name }}</ion-card-title>
              <ion-card-subtitle>{{ item.address }}</ion-card-subtitle>
            </div>
          </div>
        </ion-card-header>
      </ion-card>
    </div>
  </ion-content>
</template>

<script setup lang="ts">
import type { Location } from '@/types';
import { onMounted, onBeforeUnmount, ref } from 'vue';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButtons,
  IonBackButton,
  IonCard,
  IonCardHeader,
  IonCardSubtitle,
  IonCardTitle,
  IonThumbnail,
  IonIcon,
} from '@ionic/vue';
import { heartOutline } from 'ionicons/icons';
import { useLocationStore } from '@/stores/location';

const props = defineProps<{
  returnCallback: () => void;
}>();

const locationStore = useLocationStore();
const wish_location: Location[] = locationStore.wishLocations;
const callbackExecuted = ref(false);

const goBack = () => {
  const navEl = document.querySelector('ion-nav');
  if (navEl) {
    if (!callbackExecuted.value) {
      props.returnCallback();
      callbackExecuted.value = true;
    }
    navEl.pop().catch(err => console.error(err));
  }
}

// コンポーネントがアンマウントされる際にもコールバックを実行
onBeforeUnmount(() => {
  if (!callbackExecuted.value) {
    props.returnCallback();
    callbackExecuted.value = true;
  }
});

</script>

<style scoped>
.card-content {
  display: flex;
  align-items: center;
  gap: 16px;
}

.photo-container {
  width: 80px;
  height: 80px;
  flex-shrink: 0;
}

.text-content {
  flex-grow: 1;
}

ion-thumbnail {
  width: 80px;
  height: 80px;
  --border-radius: 8px;
  background: var(--ion-color-light);
  display: flex;
  align-items: center;
  justify-content: center;
}

ion-icon {
  font-size: 32px;
  color: var(--ion-color-medium);
}
</style>
