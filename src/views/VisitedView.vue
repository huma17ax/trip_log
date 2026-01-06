<template>
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button @click="goBack" text=""></ion-back-button>
        </ion-buttons>
        <ion-title>訪問記録</ion-title>
      </ion-toolbar>
    </ion-header>
    
    <ion-content class="ion-padding">
      <div id="visited">
        <ion-card 
          v-for="item in visited" 
          :key="item.id" 
          @click="navigateTo(item)"
          @contextmenu.prevent="openActionSheet(item)"
          @touchstart="startLongPress(item)"
          @touchend="cancelLongPress"
          @touchmove="cancelLongPress"
        >
          <ion-card-header>
            <div class="card-content">
              <div class="photo-container">
                <img v-if="item.photos.length > 0" :src="item.photos[0]" alt="訪問地の写真" />
                <img v-else-if="getLocation(item.location_id)?.google_place_photo" :src="getLocation(item.location_id)?.google_place_photo" alt="訪問地の写真" />
                <ion-thumbnail v-else>
                  <ion-icon :icon="locationOutline" size="large"></ion-icon>
                </ion-thumbnail>
              </div>
              <div class="text-content">
                <ion-card-title>{{ getLocation(item.location_id)?.name }}</ion-card-title>
                <ion-card-subtitle>{{ item.date }}</ion-card-subtitle>
              </div>
            </div>
          </ion-card-header>
        </ion-card>
      </div>

      <ion-action-sheet
        :is-open="isActionSheetOpen"
        :header="selectedVisited ? `${getLocation(selectedVisited.location_id)?.name}＠${selectedVisited.date}` : ''"
        :buttons="actionSheetButtons"
        @didDismiss="isActionSheetOpen = false"
      ></ion-action-sheet>
    </ion-content>
</template>

<script setup lang="ts">
import type { Location, Visited } from '@/types';
import { computed, onBeforeUnmount, ref } from 'vue';
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
  IonActionSheet
} from '@ionic/vue';
import { locationOutline, trashOutline } from 'ionicons/icons';
import { useLocationStore } from '@/stores/location';
import VisitedDetailView from './VisitedDetailView.vue';

const props = defineProps<{
  returnCallback: () => void;
}>();

const locationStore = useLocationStore();
const visited = computed(() => locationStore.visited);
const locations = computed(() => locationStore.locations);
const callbackExecuted = ref(false);

// Action Sheet state
const isActionSheetOpen = ref(false);
const selectedVisited = ref<Visited | null>(null);
let longPressTimer: ReturnType<typeof setTimeout> | null = null;

// Action Sheet buttons configuration
const actionSheetButtons = [
  {
    text: '削除',
    role: 'destructive',
    icon: trashOutline,
    handler: () => {
      handleDelete();
    }
  },
  {
    text: 'キャンセル',
    role: 'cancel'
  }
];

const getLocation = (location_id: string) => {
  return locations.value.find(location => location.id === location_id);
}

// Long press handlers for touch devices
const startLongPress = (item: Visited) => {
  longPressTimer = setTimeout(() => {
    openActionSheet(item);
  }, 500);
};

const cancelLongPress = () => {
  if (longPressTimer) {
    clearTimeout(longPressTimer);
    longPressTimer = null;
  }
};

const openActionSheet = (item: Visited) => {
  cancelLongPress();
  selectedVisited.value = item;
  isActionSheetOpen.value = true;
};

const handleDelete = async () => {
  if (selectedVisited.value) {
    const deletedId = selectedVisited.value.id;
    await locationStore.deleteVisited(deletedId);
    selectedVisited.value = null;
  }
};

const goBack = () => {
  const navEl = document.querySelector('ion-nav');
  if (navEl) {
    if (!callbackExecuted.value) {
      props.returnCallback();
      callbackExecuted.value = true;
    }
    // navEl.pop().catch(err => console.error(err));
  }
}

const navigateTo = (visited: Visited) => {
  const navEl = document.querySelector('ion-nav');
  if (navEl) {
    const componentInstance = markRaw(VisitedDetailView);
    navEl.push(componentInstance, { targetVisitedId: visited.id }).catch(err => console.error(err));
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

.photo-container img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 8px;
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
